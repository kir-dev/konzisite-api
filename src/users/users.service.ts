import { accessibleBy } from '@casl/prisma'
import { Injectable, NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { CaslAbilityFactory } from 'src/auth/casl-ability.factory'
import { publicUserProjection } from 'src/utils/publicUserProjection'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUserDto } from './dto/CreateUser.dto'
import { UpdateUserDto } from './dto/UpdateUser.dto'
import { UserDetails, UserStats } from './dto/UserDetails'
import { UserEntity } from './dto/UserEntity.dto'
import { UserList } from './dto/UserList.dto'
import { UserProfileDto } from './dto/UserProfile.dto'

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly caslFactory: CaslAbilityFactory,
  ) {}

  async findAll(
    nameFilter?: string,
    page?: number,
    pageSize?: number,
  ): Promise<UserList> {
    const [users, userCount] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          fullName: {
            contains: nameFilter ?? '',
            mode: 'insensitive',
          },
        },
        include: {
          _count: {
            select: {
              participations: true,
            },
          },
          presentations: {
            include: {
              ratings: {
                select: {
                  value: true,
                },
              },
            },
          },
        },
        orderBy: [
          {
            presentations: {
              _count: 'desc',
            },
          },
          {
            fullName: 'asc',
          },
        ],
        take: pageSize ? pageSize : undefined,
        skip: (page || 0) * (pageSize || 2),
      }),
      this.prisma.user.aggregate({
        _count: { id: true },
        where: {
          fullName: {
            contains: nameFilter ?? '',
            mode: 'insensitive',
          },
        },
      }),
    ])

    return {
      userList: users.map(({ presentations: p, _count: c, id, fullName }) => {
        const ratings: number[] = p.reduce<number[]>(
          (arr, pres) => [...arr, ...pres.ratings.map((r) => r.value)],
          [],
        )
        const presentations = p.length
        const attendances = c.participations
        const averageRating =
          ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length

        return { presentations, attendances, averageRating, id, fullName }
      }),
      userCount: userCount._count.id,
    }
  }

  async profile(oldUser: UserEntity): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: oldUser.id },
    })
    return {
      ...user,
      jwt:
        user.isAdmin !== oldUser.isAdmin
          ? this.jwtService.sign(user, {
              secret: process.env.JWT_SECRET,
              expiresIn: '2 days',
            })
          : undefined,
    }
  }

  private async userStats(id: number): Promise<UserStats> {
    const userStats = await this.prisma.user.findUnique({
      where: { id },
      include: {
        presentations: {
          include: {
            consultation: {
              include: {
                participants: true,
              },
            },
            ratings: true,
          },
        },
        requestedConsultations: true,
        supportedConsultations: true,
        participations: true,
      },
    })
    if (userStats === null) {
      throw new NotFoundException('A felhasználó nem található!')
    }

    const ratings = userStats.presentations.reduce<number[]>(
      (arr, pres) => [...arr, ...pres.ratings.map((r) => r.value)],
      [],
    )
    return {
      allParticipants: userStats.presentations.reduce(
        (acc, cur) => acc + cur.consultation.participants.length,
        0,
      ),
      averageRating:
        ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length,
      participationCount: userStats.participations.length,
      presentationCount: userStats.presentations.length,
      ratingCount: ratings.length,
      requestCount:
        userStats.requestedConsultations.length +
        userStats.supportedConsultations.length,
    }
  }

  async findOne(id: number, loggedInUser: UserEntity): Promise<UserDetails> {
    const ability = this.caslFactory.createForConsultationRead(loggedInUser)
    const [user, stats] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id },
        include: {
          presentations: {
            where: accessibleBy(ability).Presentation,
            include: {
              consultation: {
                include: {
                  subject: true,
                  participants: true,
                },
              },
              ratings: {
                include: {
                  ratedBy: {
                    include: {
                      user: publicUserProjection,
                    },
                  },
                },
              },
            },
          },
          participations: {
            where: accessibleBy(ability).Participation,
            include: {
              consultation: {
                include: {
                  subject: true,
                },
              },
            },
          },
          requestedConsultations: {
            include: {
              subject: true,
              supporters: true,
            },
          },
          supportedConsultations: {
            include: {
              subject: true,
              supporters: true,
            },
          },
        },
      }),
      this.userStats(id),
    ])

    const presentations = user.presentations.map(
      ({ ratings, consultation }) => {
        return {
          ...consultation,
          participants: consultation.participants.length,
          ratings: ratings.map(({ ratedBy, anonymous, ...rating }) => {
            if (anonymous)
              return {
                ...rating,
                anonymous,
                participationId: -1, // can get userId from participationId
                rater: {
                  id: -1,
                  fullName: 'Névtelen felhasználó',
                },
              }
            return {
              ...rating,
              anonymous,
              rater: ratedBy.user,
            }
          }),
        }
      },
    )

    const participations = user.participations.map(({ consultation }) => {
      return { ...consultation }
    })

    return {
      id: user.id,
      fullName: user.fullName,
      isAdmin: user.isAdmin,
      presentations,
      participations,
      consultationRequests: user.requestedConsultations
        .concat(user.supportedConsultations)
        .map((cr) => ({ ...cr, supporters: cr.supporters.length })),
      stats,
    }
  }

  async findByAuthSchId(authSchId: string): Promise<UserEntity> {
    return this.prisma.user.findUnique({ where: { authSchId: authSchId } })
  }

  async create(data: CreateUserDto): Promise<UserEntity> {
    return this.prisma.user.create({ data })
  }

  async update(id: number, data: UpdateUserDto): Promise<UserEntity> {
    return this.prisma.user.update({ data, where: { id: id } })
  }

  async promoteUser(id: number): Promise<UserEntity> {
    return this.prisma.user.update({
      data: { isAdmin: true },
      where: { id: id },
    })
  }

  async remove(id: number): Promise<UserEntity> {
    return this.prisma.user.delete({ where: { id: id } })
  }
}

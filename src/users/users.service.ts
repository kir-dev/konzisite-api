import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUserDto } from './dto/CreateUser.dto'
import { UpdateUserDto } from './dto/UpdateUser.dto'
import { UserDetails } from './dto/UserDetails'
import { UserEntity } from './dto/UserEntity.dto'
import { UserPreview } from './dto/UserPreview.dto'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    nameFilter?: string,
    page?: number,
    pageSize?: number,
  ): Promise<UserPreview[]> {
    const users = await this.prisma.user.findMany({
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
      take: pageSize || 20,
      skip: (page || 0) * (pageSize || 20),
    })

    return users.map(({ presentations: p, _count: c, id, fullName }) => {
      const ratings: number[] = p.reduce<number[]>(
        (arr, pres) => [...arr, ...pres.ratings.map((r) => r.value)],
        [],
      )
      const presentations = p.length
      const attendances = c.participations
      const avarageRating =
        ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length

      return { presentations, attendances, avarageRating, id, fullName }
    })
  }

  async profile(id: number): Promise<UserEntity> {
    return await this.prisma.user.findUnique({ where: { id } })
  }

  async findOne(id: number): Promise<UserDetails> {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      include: {
        presentations: {
          include: {
            consultation: {
              include: {
                subject: true,
              },
            },
            ratings: {
              include: {
                ratedBy: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
        participations: {
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
          },
        },
      },
    })

    const ratings: number[] = user.presentations.reduce<number[]>(
      (arr, pres) => [...arr, ...pres.ratings.map((r) => r.value)],
      [],
    )
    const avarageRating =
      ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length

    const presentations = user.presentations.map(
      ({ ratings, consultation }) => {
        return {
          ...consultation,
          ratings: ratings.map(({ ratedBy, anonymous, ...rating }) => {
            if (anonymous)
              return {
                ...rating,
                anonymous,
                participationId: -1, // can get userId from participationId
                rater: {
                  id: -1,
                  fullName: 'Anonymous',
                },
              }
            return {
              ...rating,
              anonymous,
              rater: {
                id: ratedBy.userId,
                fullName: ratedBy.user.fullName,
              },
            }
          }),
        }
      },
    )

    const participations = user.participations.map(({ consultation }) => {
      return { ...consultation }
    })

    const consultationRequests = user.requestedConsultations

    return {
      id: user.id,
      fullName: user.fullName,
      presentations,
      participations,
      consultationRequests,
      avarageRating,
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

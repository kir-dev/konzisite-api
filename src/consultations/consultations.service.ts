/* eslint-disable @typescript-eslint/no-unused-vars */
import { accessibleBy } from '@casl/prisma'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Major, Prisma } from '@prisma/client'
import { unlink } from 'fs'
import { join } from 'path'
import { CaslAbilityFactory } from 'src/auth/casl-ability.factory'
import { UserEntity } from 'src/users/dto/UserEntity.dto'
import { publicUserProjection } from 'src/utils/publicUserProjection'
import { PrismaService } from '../prisma/prisma.service'
import { ConsultationDetailsDto } from './dto/ConsultationDetails.dto'
import { ConsultationEntity } from './dto/ConsultationEntity.dto'
import { CreateConsultationDto } from './dto/CreateConsultation.dto'
import { UpdateConsultationDto } from './dto/UpdateConsultation.dto'

@Injectable()
export class ConsultationsService {
  constructor(
    private prisma: PrismaService,
    private caslFactory: CaslAbilityFactory,
  ) {}

  async findAll(
    user: UserEntity,
    major?: Major,
    startDate?: Date,
    endDate?: Date,
  ) {
    const ability = this.caslFactory.createForConsultationRead(user)
    let results
    try {
      results = await this.prisma.consultation.findMany({
        where: {
          AND: [
            accessibleBy(ability).Consultation,
            {
              ...(major ? { subject: { majors: { has: major } } } : {}),
              ...(startDate.getTime()
                ? { startDate: { gte: startDate } }
                : { startDate: {} }),
              ...(endDate.getTime()
                ? {
                    endDate: {
                      lt: new Date(endDate.getTime() + 60 * 60 * 24 * 1000),
                    },
                  }
                : {}),
            },
          ],
        },
        orderBy: { startDate: 'asc' },
        include: {
          subject: true,
          presentations: {
            include: {
              user: publicUserProjection,
              ratings: true,
            },
          },
        },
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2009' && (startDate || endDate)) {
          throw new HttpException('Hibás dátum!', HttpStatus.BAD_REQUEST)
        }
      }
      if (major) {
        throw new HttpException('Hibás szak!', HttpStatus.BAD_REQUEST)
      }
      throw e
    }

    return results.map(({ ownerId, subjectId, requestId, ...details }) => ({
      ...details,
      presentations: details.presentations.map((p) => ({
        averageRating:
          p.ratings.reduce((acc, rating) => acc + rating.value, 0) /
            p.ratings.length || 0,
        ...p.user,
      })),
    }))
  }

  async findOne(id: number, user: UserEntity): Promise<ConsultationEntity> {
    const ability = this.caslFactory.createForConsultationRead(user)
    // the accessiblyBy filter doesn't work with findUnique, so we're using findMany,
    // but there can only be zero or one result, because id is unique.
    const consultation = await this.prisma.consultation.findMany({
      where: { AND: [accessibleBy(ability).Consultation, { id }] },
    })
    if (consultation.length === 0) {
      // it's possible that the user just doesn't have permission to view it, but they don't have to know that
      throw new HttpException(
        'Nem található a konzultáció',
        HttpStatus.NOT_FOUND,
      )
    }
    return consultation[0]
  }

  async findOneWithRelations(
    id: number,
    user: UserEntity,
    participationId: number,
  ): Promise<ConsultationDetailsDto> {
    const ability = this.caslFactory.createForConsultationRead(user)
    // the accessiblyBy filter doesn't work with findUnique, so we're using findMany,
    // but there can only be zero or one result, because id is unique.
    const consultation = await this.prisma.consultation.findMany({
      where: { AND: [accessibleBy(ability).Consultation, { id }] },
      include: {
        targetGroups: true,
        presentations: {
          include: {
            ratings: true,
            user: {
              include: {
                presentations: {
                  include: {
                    ratings: true,
                  },
                },
              },
            },
          },
        },
        subject: true,
        request: true,
        owner: publicUserProjection,
        participants: {
          include: {
            user: publicUserProjection,
          },
        },
      },
    })
    if (consultation.length === 0) {
      // it's possible that the user just doesn't have permission to view it, but they don't have to know that
      throw new HttpException(
        'Nem található a konzultáció',
        HttpStatus.NOT_FOUND,
      )
    }
    const { ownerId, subjectId, requestId, ...details } = consultation[0]

    const averageRatings = details.presentations
      .map(({ user }) =>
        user.presentations.reduce<number[]>(
          (arr, pres) => [...arr, ...pres.ratings.map((r) => r.value)],
          [],
        ),
      )
      .map((r) => r.reduce((sum, rating) => sum + rating, 0) / r.length)

    return {
      ...details,
      owner: details.owner,
      presentations: details.presentations.map(({ user, ratings }, index) => ({
        id: user.id,
        fullName: user.fullName,
        averageRating: averageRatings[index],
        averageRatingForConsultation:
          ratings.reduce((acc, rating) => acc + rating.value, 0) /
            ratings.length || 0,
        rating: ratings.find((r) => r.participationId === participationId),
      })),
      participants: details.participants.map(({ user }) => ({
        ...user,
      })),
    }
  }

  create(dto: CreateConsultationDto, user: UserEntity) {
    const {
      subjectId,
      targetGroupIds,
      presenterIds,
      requestId,
      ...restOfData
    } = dto
    const requestConnection = requestId
      ? {
          request: {
            connect: {
              id: requestId,
            },
          },
        }
      : {}
    return this.prisma.consultation.create({
      data: {
        ...restOfData,
        ...requestConnection,
        owner: {
          connect: {
            id: user.id,
          },
        },
        subject: {
          connect: {
            id: subjectId,
          },
        },
        targetGroups: {
          connect: targetGroupIds.map((id) => ({ id })),
        },
        presentations: {
          createMany: {
            data: presenterIds.map((userId) => ({ userId })),
          },
        },
      },
    })
  }

  async update(id: number, dto: UpdateConsultationDto) {
    const konzi = await this.prisma.consultation.findUnique({
      where: { id },
      include: {
        targetGroups: true,
        presentations: true,
        subject: true,
        request: true,
        owner: true,
        participants: true,
      },
    })
    const { subjectId, targetGroupIds, presenterIds, ...restOfData } = dto
    return this.prisma.consultation.update({
      where: { id },
      data: {
        ...restOfData,
        subject: {
          connect: { id: dto.subjectId || konzi.subjectId },
        },
        targetGroups: {
          disconnect: konzi.targetGroups
            .filter((g) =>
              targetGroupIds ? !targetGroupIds.includes(g.id) : false,
            )
            .map((g) => ({ id: g.id })),
          connect: targetGroupIds
            ?.filter(
              (parameterGroupId) =>
                konzi.targetGroups?.filter(
                  (groupInDb) => groupInDb.id === parameterGroupId,
                ).length === 0,
            )
            .map((id) => ({ id })),
        },
        presentations: {
          deleteMany: konzi.presentations
            .filter((p) =>
              presenterIds ? !presenterIds.includes(p.userId) : false,
            )
            .map((g) => ({ id: g.id })),
          createMany: {
            data:
              presenterIds
                ?.filter(
                  (parameterUserId) =>
                    konzi.presentations?.filter(
                      (presentationsInDb) =>
                        presentationsInDb.userId === parameterUserId,
                    ).length === 0,
                )
                .map((userId) => ({ userId })) || [],
          },
        },
      },
    })
  }

  async updateFileName(id: number, fileName: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id },
    })
    if (consultation.fileName && fileName !== consultation.fileName) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      unlink(join(process.cwd(), '/static', consultation.fileName), () => {})
    }

    return await this.prisma.consultation.update({
      where: { id },
      data: { fileName },
    })
  }

  async removeFileName(id: number) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id },
    })
    if (consultation.fileName) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      unlink(join(process.cwd(), '/static', consultation.fileName), () => {})
    }

    return await this.prisma.consultation.update({
      where: { id },
      data: { fileName: null },
    })
  }

  remove(id: number) {
    return this.prisma.consultation.delete({ where: { id } })
  }
}

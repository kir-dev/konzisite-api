/* eslint-disable @typescript-eslint/no-unused-vars */
import { accessibleBy } from '@casl/prisma'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { unlink } from 'fs'
import { join } from 'path'
import { CaslAbilityFactory } from 'src/auth/casl-ability.factory'
import { UserEntity } from 'src/users/dto/UserEntity.dto'
import { PrismaService } from '../prisma/prisma.service'
import { CreateConsultationDto } from './dto/CreateConsultation.dto'
import { UpdateConsultationDto } from './dto/UpdateConsultation.dto'

@Injectable()
export class ConsultationsService {
  constructor(
    private prisma: PrismaService,
    private caslFactory: CaslAbilityFactory,
  ) {}

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

  async findAll(user: UserEntity) {
    const ability = this.caslFactory.createForConsultationRead(user)
    const results = await this.prisma.consultation.findMany({
      where: accessibleBy(ability).Consultation,
      include: {
        subject: true,
        presentations: {
          include: {
            user: true,
            ratings: true,
          },
        },
      },
    })
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

  async findOne(id: number, user: UserEntity) {
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
  ) {
    const ability = this.caslFactory.createForConsultationRead(user)
    // the accessiblyBy filter doesn't work with findUnique, so we're using findMany,
    // but there can only be zero or one result, because id is unique.
    const consultation = await this.prisma.consultation.findMany({
      where: { AND: [accessibleBy(ability).Consultation, { id }] },
      include: {
        targetGroups: true,
        presentations: {
          include: {
            user: true,
            ratings: true,
          },
        },
        subject: true,
        request: true,
        owner: true,
        participants: {
          include: {
            user: true,
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

    return {
      ...details,
      presentations: details.presentations.map(({ user, ratings }) => ({
        ...user,
        averageRating:
          ratings.reduce((acc, rating) => acc + rating.value, 0) /
            ratings.length || 0,
        rating: ratings.find((r) => r.participationId === participationId),
      })),
      participants: details.participants.map(({ user }) => ({ ...user })),
    }
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

  remove(id: number) {
    return this.prisma.consultation.delete({ where: { id } })
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
}

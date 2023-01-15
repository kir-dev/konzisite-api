import { Injectable } from '@nestjs/common'
import { unlink } from 'fs'
import { join } from 'path'
import { PrismaService } from '../prisma/prisma.service'
import { CreateConsultationDto } from './dto/CreateConsultation.dto'
import { UpdateConsultationDto } from './dto/UpdateConsultation.dto'

@Injectable()
export class ConsultationsService {
  constructor(private prisma: PrismaService) {}
  create(dto: CreateConsultationDto) {
    const {
      ownerId,
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
            id: ownerId,
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

  async findAll() {
    const results = await this.prisma.consultation.findMany({
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

  async findOne(id: number, participationId?: number) {
    const { ownerId, subjectId, requestId, ...details } =
      await this.prisma.consultation.findUnique({
        where: { id },
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
      unlink(join(process.cwd(), '/static', consultation.fileName), () => {})
    }

    return await this.prisma.consultation.update({
      where: { id },
      data: { fileName },
    })
  }
}

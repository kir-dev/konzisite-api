import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateConsultationDto } from './dto/CreateConsultation.dto'
import { UpdateConsultationDto } from './dto/UpdateConsultation.dto'

@Injectable()
export class ConsultationsService {
  constructor(private prisma: PrismaService) {}
  create(dto: CreateConsultationDto) {
    const { ownerId, subjectId, targetGroupIds, presenterIds, ...restOfData } =
      dto
    return this.prisma.consultation.create({
      data: {
        ...restOfData,
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
        targetGroups: true,
        presentations: {
          include: {
            user: true,
          },
        },
      },
    })
    return results.map(({ ownerId, subjectId, ...details }) => ({
      ...details,
      presentations: details.presentations.map((p) => ({
        presentationId: p.id,
        ...p.user,
      })),
    }))
  }

  findOne(id: number) {
    return this.prisma.consultation.findUnique({
      where: { id },
      include: {
        targetGroups: true,
        presentations: true,
      },
    })
  }

  async update(id: number, dto: UpdateConsultationDto) {
    const konzi = await this.findOne(id)
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
}

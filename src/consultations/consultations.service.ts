import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateConsultationDto } from './dto/CreateConsultation.dto'

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
    return this.prisma.consultation.findUnique({ where: { id } })
  }

  update(id: number, data: Prisma.ConsultationUncheckedUpdateInput) {
    return this.prisma.consultation.update({ where: { id }, data })
  }

  remove(id: number) {
    return this.prisma.consultation.delete({ where: { id } })
  }
}

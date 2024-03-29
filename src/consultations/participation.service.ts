import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class ParticipationService {
  constructor(private prisma: PrismaService) {}

  async findAllByUserId(userId: number) {
    const participations = await this.prisma.participation.findMany({
      where: {
        userId,
      },
      include: {
        consultation: true,
      },
    })

    return participations
  }

  async findAllByConsultationId(consultationId: number) {
    const participations = await this.prisma.participation.findMany({
      where: {
        consultationId,
      },
      include: {
        user: true,
      },
    })

    return participations
  }

  async findOne(consultationId: number, userId: number) {
    const participation = await this.prisma.participation.findUnique({
      where: {
        consultationId_userId: {
          consultationId: consultationId,
          userId: userId,
        },
      },
    })

    return participation
  }

  create(data: Prisma.ParticipationUncheckedCreateInput) {
    return this.prisma.participation.create({ data })
  }

  remove(participationId: number) {
    return this.prisma.participation.delete({
      where: { id: participationId },
    })
  }
}

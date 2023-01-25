import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class PresentationService {
  constructor(private prisma: PrismaService) {}

  async findAllByUserId(userId: number) {
    const presentations = await this.prisma.presentation.findMany({
      where: {
        userId,
      },
      include: {
        consultation: true,
      },
    })

    return presentations
  }

  async findAllByConsultationId(consultationId: number) {
    const presentations = await this.prisma.presentation.findMany({
      where: {
        consultationId,
      },
      include: {
        user: true,
      },
    })

    return presentations
  }

  async findOne(consultationId: number, userId: number) {
    const presentation = await this.prisma.presentation.findUnique({
      where: {
        consultationId_userId: {
          consultationId: consultationId,
          userId: userId,
        },
      },
    })

    return presentation
  }

  create(data: Prisma.PresentationUncheckedCreateInput) {
    return this.prisma.presentation.create({ data })
  }

  createMany(data: Prisma.PresentationUncheckedCreateInput[]) {
    return this.prisma.presentation.createMany({ data })
  }

  remove(id: number) {
    return this.prisma.presentation.delete({
      where: { id },
    })
  }
}

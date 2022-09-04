import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class RatingService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.RatingUncheckedCreateInput) {
    return this.prisma.rating.create({ data })
  }

  remove(id: number) {
    return this.prisma.rating.delete({
      where: { id },
    })
  }

  update(id: number, data: Prisma.RatingUncheckedUpdateInput) {
    return this.prisma.rating.update({
      where: { id },
      data,
    })
  }

  findByIds(presentationId: number, participationId: number) {
    return this.prisma.rating.findUnique({
      where: {
        participationId_presentationId: { participationId, presentationId },
      },
    })
  }

  findRatingByUser(userId: number) {
    return this.prisma.rating.findMany({
      where: {
        ratedBy: {
          userId,
        },
      },
      include: {
        ratedPresentation: {
          select: {
            user: true,
          },
        },
      },
    })
  }

  findRatingsForUser(userId: number) {
    return this.prisma.rating.findMany({
      where: {
        ratedPresentation: {
          userId,
        },
      },
      include: {
        ratedBy: {
          select: {
            user: true,
          },
        },
      },
    })
  }

  findRatingsForPresentation(presentationId: number) {
    return this.prisma.rating.findMany({
      where: {
        presentationId,
      },
      include: {
        ratedBy: {
          include: {
            user: true,
          },
        },
      },
    })
  }

  avarageRatings() {
    return this.prisma.rating.groupBy({
      by: ['presentationId'],
      _avg: {
        value: true,
      },
    })
  }
}

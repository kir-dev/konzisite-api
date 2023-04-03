import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserEntity } from 'src/users/dto/UserEntity.dto'
import { publicUserProjection } from 'src/utils/publicUserProjection'
import { CreateRequestDto } from './dto/CreateRequest.dto'
import { RequestDetailsDto } from './dto/RequestDetails.dto'
import { RequestPreviewDto } from './dto/RequestPreview.dto'
import { UpdateRequestDto } from './dto/UpdateRequest.dto'

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    validOnly = false,
    user?: UserEntity,
    limit?: number,
  ): Promise<RequestPreviewDto[]> {
    const requests = await this.prisma.consultationRequest.findMany({
      include: {
        initializer: publicUserProjection,
        subject: true,
        _count: {
          select: {
            supporters: true,
            consultations: true,
          },
        },
        supporters: {
          where: {
            id: user?.id,
          },
        },
      },
      where: {
        ...(validOnly ? { expiryDate: { gt: new Date() } } : {}),
      },
      orderBy: { expiryDate: 'asc' },
      take: limit ? limit : undefined,
    })

    return requests.map(({ _count, supporters, ...request }) => {
      return {
        ...request,
        supporterCount: _count.supporters,
        consultationCount: _count.consultations,
        currentUserSupports: supporters.length !== 0,
      }
    })
  }

  async findOne(id: number): Promise<RequestDetailsDto> {
    const request = await this.prisma.consultationRequest.findUnique({
      where: {
        id,
      },
      include: {
        initializer: publicUserProjection,
        subject: true,
        supporters: publicUserProjection,
        consultations: {
          include: {
            presentations: {
              include: {
                user: publicUserProjection,
                ratings: true,
              },
            },
            subject: true,
          },
        },
      },
    })

    if (request === null) {
      throw new NotFoundException('A konzi kérés nem található!')
    }

    const { consultations, ...restOfRequest } = request

    const consultationsWithSubject = consultations.map(
      ({ presentations, ...c }) => {
        return {
          ...c,
          presentations: presentations.map((p) => ({
            averageRating:
              p.ratings.reduce((acc, rating) => acc + rating.value, 0) /
                p.ratings.length || 0,
            ...p.user,
          })),
        }
      },
    )

    return { consultations: consultationsWithSubject, ...restOfRequest }
  }

  create(dto: CreateRequestDto, user: UserEntity) {
    const { subjectId, ...restOfData } = dto
    return this.prisma.consultationRequest.create({
      data: {
        ...restOfData,
        initializer: { connect: { id: user.id } },
        subject: { connect: { id: subjectId } },
      },
    })
  }

  update(id: number, dto: UpdateRequestDto) {
    return this.prisma.consultationRequest.update({
      where: { id },
      data: { ...dto },
    })
  }

  remove(id: number) {
    return this.prisma.consultationRequest.delete({ where: { id } })
  }

  addSupporter(requestId: number, user: UserEntity) {
    return this.prisma.consultationRequest.update({
      where: { id: requestId },
      data: {
        supporters: {
          connect: {
            id: user.id,
          },
        },
      },
    })
  }

  removeSupporter(requestId: number, user: UserEntity) {
    return this.prisma.consultationRequest.update({
      where: { id: requestId },
      data: {
        supporters: {
          disconnect: {
            id: user.id,
          },
        },
      },
    })
  }
}

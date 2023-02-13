import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserEntity } from 'src/users/dto/UserEntity.dto'
import { CreateRequestDto } from './dto/CreateRequest.dto'
import { RequestDetailsDto } from './dto/RequestDetails.dto'
import { RequestPreviewDto } from './dto/RequestPreview.dto'
import { UpdateRequestDto } from './dto/UpdateRequest.dto'

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<RequestPreviewDto[]> {
    const requests = await this.prisma.consultationRequest.findMany({
      include: {
        initializer: true,
        subject: true,
        _count: {
          select: {
            supporters: true,
            consultation: true,
          },
        },
      },
    })

    return requests.map(({ initializer, _count, ...request }) => {
      return {
        ...request,
        initializer: { fullName: initializer.fullName, id: initializer.id },
        supporterCount: _count.supporters,
        consultationCount: _count.consultation,
      }
    })
  }

  async findOne(id: number): Promise<RequestDetailsDto> {
    const { initializer, supporters, consultation, ...request } =
      await this.prisma.consultationRequest.findUnique({
        where: {
          id,
        },
        include: {
          initializer: true,
          subject: true,
          supporters: true,
          consultation: true,
        },
      })

    return {
      initializer: { fullName: initializer.fullName, id: initializer.id },
      supporters: supporters.map((s) => {
        return { fullName: s.fullName, id: s.id }
      }),
      consultations: consultation,
      ...request,
    }
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

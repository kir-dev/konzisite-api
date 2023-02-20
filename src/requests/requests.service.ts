import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
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

  async findAll(): Promise<RequestPreviewDto[]> {
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
      },
    })

    return requests.map(({ _count, ...request }) => {
      return {
        ...request,
        supporterCount: _count.supporters,
        consultationCount: _count.consultations,
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
        consultations: true,
      },
    })

    if (request === null) {
      throw new HttpException(
        'A konzi kérés nem található!',
        HttpStatus.NOT_FOUND,
      )
    }

    return request
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

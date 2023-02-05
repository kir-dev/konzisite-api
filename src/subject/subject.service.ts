import { Injectable } from '@nestjs/common'
import { UserEntity } from 'src/users/dto/UserEntity.dto'
import { CreateManyResponse } from 'src/utils/CreateManyResponse.dto'
import { PrismaService } from '../prisma/prisma.service'
import { CreateSubjectDto } from './dto/CreateSubject.dto'
import { SubjectEntity } from './dto/SubjectEntity.dto'
import { UpdateSubjectDto } from './dto/UpdateSubject.dto'

@Injectable()
export class SubjectService {
  constructor(private prisma: PrismaService) {}

  async findAll(nameFilter?: string): Promise<SubjectEntity[]> {
    return this.prisma.subject.findMany({
      where: {
        name: {
          contains: nameFilter ?? '',
          mode: 'insensitive',
        },
      },
    })
  }

  async findOne(id: number): Promise<SubjectEntity> {
    return this.prisma.subject.findUnique({ where: { id: id } })
  }

  async create(data: CreateSubjectDto): Promise<SubjectEntity> {
    return this.prisma.subject.create({ data })
  }

  async createMany(data: CreateSubjectDto[]): Promise<CreateManyResponse> {
    return this.prisma.subject.createMany({ data })
  }

  async update(id: number, data: UpdateSubjectDto): Promise<SubjectEntity> {
    return this.prisma.subject.update({ data, where: { id: id } })
  }

  async remove(id: number): Promise<SubjectEntity> {
    return this.prisma.subject.delete({ where: { id: id } })
  }

  async subscribe(user: UserEntity, subjectId: number): Promise<SubjectEntity> {
    const current = await this.prisma.subject.findUnique({
      select: { subscribers: true },
      where: { id: subjectId },
    })

    return this.prisma.subject.update({
      where: { id: subjectId },
      data: {
        subscribers: {
          set: [...current.subscribers, user],
        },
      },
    })
  }

  async unsubscribe(
    user: UserEntity,
    subjectId: number,
  ): Promise<SubjectEntity> {
    const current = await this.prisma.subject.findUnique({
      select: { subscribers: true },
      where: { id: subjectId },
    })

    return this.prisma.subject.update({
      where: { id: subjectId },
      data: {
        subscribers: {
          set: [...current.subscribers.filter((x) => x != user)],
        },
      },
    })
  }
}

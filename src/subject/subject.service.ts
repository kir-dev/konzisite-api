import { Injectable } from '@nestjs/common'
import { Subject } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateSubjectDto } from './dto/CreateSubject.dto'
import { UpdateSubjectDto } from './dto/UpdateSubject.dto'

@Injectable()
export class SubjectService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateSubjectDto): Promise<Subject> {
    return this.prisma.subject.create({ data })
  }

  async findAll(): Promise<Subject[]> {
    return this.prisma.subject.findMany()
  }

  async findOne(id: number): Promise<Subject> {
    return this.prisma.subject.findUnique({ where: { id: id } })
  }

  async update(id: number, data: UpdateSubjectDto): Promise<Subject> {
    return this.prisma.subject.update({ data, where: { id: id } })
  }

  async remove(id: number): Promise<Subject> {
    return this.prisma.subject.delete({ where: { id: id } })
  }
}

import { Injectable } from '@nestjs/common'
import { Prisma, Subject } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class SubjectService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.SubjectCreateInput): Promise<Subject> {
    return this.prisma.subject.create({ data })
  }

  async findAll(): Promise<Subject[]> {
    return this.prisma.subject.findMany()
  }

  async findOne(id: number): Promise<Subject> {
    return this.prisma.subject.findUnique({ where: { id: id } })
  }

  async update(id: number, data: Prisma.SubjectUpdateInput): Promise<Subject> {
    return this.prisma.subject.update({ data, where: { id: id } })
  }

  async remove(id: number): Promise<Subject> {
    return this.prisma.subject.delete({ where: { id: id } })
  }
}

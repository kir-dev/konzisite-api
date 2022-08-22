import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ConsultationsService {
  constructor(private prisma: PrismaService) {}
  create(data: Prisma.ConsultationCreateInput) {
    return ''
  }

  findAll() {
    return `This action returns all consultations`
  }

  findOne(id: number) {
    return `This action returns a #${id} consultation`
  }

  update(id: number, updateConsultationDto: Prisma.ConsultationUpdateInput) {
    return `This action updates a #${id} consultation`
  }

  remove(id: number) {
    return `This action removes a #${id} consultation`
  }
}

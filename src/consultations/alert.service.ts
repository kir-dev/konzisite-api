import { Injectable } from '@nestjs/common'
import { Alert } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class AlertService {
  constructor(private prisma: PrismaService) {}

  async findFirst(): Promise<Alert> {
    const first = await this.prisma.alert.findFirst()
    if (first && first.validUntil && first.validUntil < new Date()) {
      return null
    }
    return first
  }
}

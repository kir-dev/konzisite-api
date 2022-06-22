import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class RatingService {
  constructor(private prisma: PrismaService) {}
}

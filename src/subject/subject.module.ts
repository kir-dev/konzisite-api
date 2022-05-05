import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'
import { SubjectController } from './subject.controller'
import { SubjectService } from './subject.service'

@Module({
  imports: [PrismaModule],
  controllers: [SubjectController],
  providers: [SubjectService],
})
export class SubjectModule {}

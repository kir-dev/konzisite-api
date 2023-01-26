import { Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { PrismaModule } from 'src/prisma/prisma.module'
import { SubjectController } from './subject.controller'
import { SubjectService } from './subject.service'

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SubjectController],
  providers: [SubjectService],
})
export class SubjectModule {}

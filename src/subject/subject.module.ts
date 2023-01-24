import { Module } from '@nestjs/common'
import { CsvModule } from 'nest-csv-parser'
import { AuthModule } from 'src/auth/auth.module'
import { PrismaModule } from 'src/prisma/prisma.module'
import { SubjectController } from './subject.controller'
import { SubjectService } from './subject.service'

@Module({
  imports: [PrismaModule, AuthModule, CsvModule],
  controllers: [SubjectController],
  providers: [SubjectService],
})
export class SubjectModule {}

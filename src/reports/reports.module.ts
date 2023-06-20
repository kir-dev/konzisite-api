import { Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { PrismaModule } from 'src/prisma/prisma.module'
import { ReportsController } from './reports.controller'
import { ReportsService } from './reports.service'

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
  imports: [PrismaModule, AuthModule],
})
export class ReportsModule {}

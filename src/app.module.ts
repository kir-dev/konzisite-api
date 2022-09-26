import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { ConsultationsModule } from './consultations/consultations.module'
import { GroupsModule } from './groups/groups.module'
import { PrismaModule } from './prisma/prisma.module'
import { SeederModule } from './seed/seeder.module'
import { SubjectModule } from './subject/subject.module'
import { UsersModule } from './users/users.module'
import { SchedulerService } from './utils/scheduler/scheduler.service'

@Module({
  imports: [
    UsersModule,
    GroupsModule,
    PrismaModule,
    SubjectModule,
    AuthModule,
    ConsultationsModule,
    SeederModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, SchedulerService],
})
export class AppModule {}

import { Module } from '@nestjs/common'
import { DevtoolsModule } from '@nestjs/devtools-integration'
import { ScheduleModule } from '@nestjs/schedule'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { ConsultationsModule } from './consultations/consultations.module'
import { GroupsModule } from './groups/groups.module'
import { PrismaModule } from './prisma/prisma.module'
import { RequestsModule } from './requests/requests.module'
import { SeederModule } from './seed/seeder.module'
import { SubjectModule } from './subject/subject.module'
import { UsersModule } from './users/users.module'
import { SchedulerService } from './utils/scheduler/scheduler.service'

@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    UsersModule,
    GroupsModule,
    PrismaModule,
    SubjectModule,
    AuthModule,
    ConsultationsModule,
    SeederModule,
    ScheduleModule.forRoot(),
    RequestsModule,
  ],
  controllers: [AppController],
  providers: [AppService, SchedulerService],
})
export class AppModule {}

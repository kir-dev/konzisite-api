import { Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ScheduleModule } from '@nestjs/schedule'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { ConsultationsModule } from './consultations/consultations.module'
import { GroupsModule } from './groups/groups.module'
import { MailingModule } from './mailing/mailing.module'
import { PrismaModule } from './prisma/prisma.module'
import { ReportsModule } from './reports/reports.module'
import { RequestsModule } from './requests/requests.module'
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
    RequestsModule,
    EventEmitterModule.forRoot(),
    MailingModule.forRoot({
      templates: {
        default: process.env.MAIL_TEMPLATE_ROOT + 'requestFulfilled.ejs',
        locationChanged: process.env.MAIL_TEMPLATE_ROOT + 'locationChanged.ejs',
      },
      mailServerUrl: process.env.MAIL_SERVER_URL,
      apiKey: process.env.MAIL_API_KEY,
    }),
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService, SchedulerService],
})
export class AppModule {}

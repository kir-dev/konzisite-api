import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { ConsultationsModule } from './consultations/consultations.module'
import { GroupsModule } from './groups/groups.module'
import { PrismaModule } from './prisma/prisma.module'
import { SubjectModule } from './subject/subject.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    UsersModule,
    GroupsModule,
    PrismaModule,
    SubjectModule,
    AuthModule,
    ConsultationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

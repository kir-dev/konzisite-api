import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersModule } from './users/users.module'
import { GroupsModule } from './groups/groups.module'
import { PrismaModule } from './prisma/prisma.module'
import { SubjectModule } from './subject/subject.module';

@Module({
  imports: [UsersModule, GroupsModule, PrismaModule, SubjectModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

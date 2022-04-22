import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';

@Module({
  imports: [UsersModule, GroupsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

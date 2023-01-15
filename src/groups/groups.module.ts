import { Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { PrismaModule } from 'src/prisma/prisma.module'
import { GroupsController } from './groups.controller'
import { GroupsService } from './groups.service'

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}

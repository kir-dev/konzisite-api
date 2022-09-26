import { Logger, Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'
import { Seeder } from './seeder'
import { SeederService } from './seeder.service'

@Module({
  imports: [PrismaModule],
  providers: [SeederService, Logger, Seeder],
})
export class SeederModule {}

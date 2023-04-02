import { Module } from '@nestjs/common'

import { PrismaModule } from 'src/prisma/prisma.module'
import { MailingService, Setup } from './mailing.service'

@Module({})
export class MailingModule {
  static forRoot(config: Setup) {
    MailingService.setup(config)
    return {
      module: MailingModule,
      providers: [MailingService],
      exports: [MailingService],
      imports: [PrismaModule],
    }
  }
}

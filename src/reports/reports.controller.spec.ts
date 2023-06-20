import { Test, TestingModule } from '@nestjs/testing'
import { AuthModule } from 'src/auth/auth.module'
import { PrismaModule } from 'src/prisma/prisma.module'
import { ReportsController } from './reports.controller'
import { ReportsService } from './reports.service'

describe('ReportsController', () => {
  let controller: ReportsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, AuthModule],
      controllers: [ReportsController],
      providers: [ReportsService],
    }).compile()

    controller = module.get<ReportsController>(ReportsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})

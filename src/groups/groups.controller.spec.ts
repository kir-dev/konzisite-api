import { Test, TestingModule } from '@nestjs/testing'
import { PrismaModule } from 'src/prisma/prisma.module'
import { GroupsController } from './groups.controller'
import { GroupsService } from './groups.service'

describe('GroupsController', () => {
  let controller: GroupsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [GroupsController],
      providers: [GroupsService],
    }).compile()

    controller = module.get<GroupsController>(GroupsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})

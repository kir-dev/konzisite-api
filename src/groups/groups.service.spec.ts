import { Test, TestingModule } from '@nestjs/testing'
import { PrismaModule } from 'src/prisma/prisma.module'
import { GroupsService } from './groups.service'

describe('GroupsService', () => {
  let service: GroupsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [GroupsService],
    }).compile()

    service = module.get<GroupsService>(GroupsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

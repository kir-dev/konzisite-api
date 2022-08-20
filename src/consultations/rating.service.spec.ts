import { Test, TestingModule } from '@nestjs/testing'
import { PrismaModule } from 'src/prisma/prisma.module'
import { RatingService } from './rating.service'

describe('RatingService', () => {
  let service: RatingService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [RatingService],
    }).compile()

    service = module.get<RatingService>(RatingService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

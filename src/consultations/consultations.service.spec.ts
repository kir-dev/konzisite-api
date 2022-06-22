import { Test, TestingModule } from '@nestjs/testing';
import { ConsultationsService } from './consultations.service';

describe('ConsultationsService', () => {
  let service: ConsultationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConsultationsService],
    }).compile();

    service = module.get<ConsultationsService>(ConsultationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { MessaggesService } from './messagges.service';

describe('MessaggesService', () => {
  let service: MessaggesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessaggesService],
    }).compile();

    service = module.get<MessaggesService>(MessaggesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

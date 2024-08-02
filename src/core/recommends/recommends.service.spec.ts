import { Test, TestingModule } from '@nestjs/testing';
import { RecommendsService } from './recommends.service';

describe('RecommendsService', () => {
  let service: RecommendsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecommendsService],
    }).compile();

    service = module.get<RecommendsService>(RecommendsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

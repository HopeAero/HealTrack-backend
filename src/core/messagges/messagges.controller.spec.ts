import { Test, TestingModule } from '@nestjs/testing';
import { MessaggesController } from './messagges.controller';
import { MessaggesService } from './messagges.service';

describe('MessaggesController', () => {
  let controller: MessaggesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessaggesController],
      providers: [MessaggesService],
    }).compile();

    controller = module.get<MessaggesController>(MessaggesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

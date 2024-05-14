import { Module } from '@nestjs/common';
import { MessaggesService } from './messagges.service';
import { MessaggesController } from './messagges.controller';

@Module({
  controllers: [MessaggesController],
  providers: [MessaggesService],
})
export class MessaggesModule {}

import { Module } from '@nestjs/common';
import { RecommendsService } from './recommends.service';
import { RecommendsController } from './recommends.controller';

@Module({
  controllers: [RecommendsController],
  providers: [RecommendsService],
})
export class RecommendsModule {}

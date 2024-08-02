import { Module } from "@nestjs/common";
import { RecommendationsService } from "./recommendations.service";
import { RecommendationsController } from "./recommendations.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Recommendation } from "./entities/recommendation.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Recommendation])],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
  exports: [RecommendationsService, TypeOrmModule],
})
export class RecommendationsModule {}

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Surgery } from "./entities/surgery.entity";
import { SurgeriesService } from "./service/surgeries.service";
import { SurgeriesController } from "./surgeries.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Surgery])],
  controllers: [SurgeriesController],
  providers: [SurgeriesService],
  exports: [SurgeriesService, TypeOrmModule],
})
export class SurgeriesModule {}

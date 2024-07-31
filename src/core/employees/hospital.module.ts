import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Hospital } from "./entities/hospital.entity";
import { HospitalsService } from "./service/hospital.service";
import { HospitalsController } from "./hospital.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Hospital])],
  controllers: [HospitalsController],
  providers: [HospitalsService],
})
export class HospitalsModule {}

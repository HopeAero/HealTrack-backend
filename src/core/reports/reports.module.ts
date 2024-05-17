import { Module } from "@nestjs/common";
import { ReportsController } from "./reports.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReportMedic } from "./entities/report.entity";
import { ReportsService } from "./service/reports.service";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([ReportMedic])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}

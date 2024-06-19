import { Module } from "@nestjs/common";
import { PatientsService } from "./service/patients.service";
import { PatientsController } from "./patients.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Patient } from "./entities/patient.entity";
import { Employee } from "@core/employees/entities/employee.entity";

import { EmployeesService } from "../employees/service/employees.service";
import { UsersModule } from "../users/users.module";
import { ReportsModule } from "../reports/reports.module";

@Module({
  imports: [UsersModule, ReportsModule, TypeOrmModule.forFeature([Patient, Employee])],
  controllers: [PatientsController],
  providers: [PatientsService, EmployeesService],
  exports: [PatientsService],
})
export class PatientsModule {}

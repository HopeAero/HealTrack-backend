import { Module } from "@nestjs/common";
import { PatientsService } from "./service/patients.service";
import { PatientsController } from "./patients.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Patient } from "./entities/patient.entity";
import { EmployeesModule } from "@core/employees/employees.module";
import { Employee } from "@core/employees/entities/employee.entity";

import { EmployeesService } from "../employees/service/employees.service";

@Module({
  imports: [TypeOrmModule.forFeature([Patient, Employee])],
  controllers: [PatientsController],
  providers: [PatientsService, EmployeesService],
  exports: [PatientsService],
})
export class PatientsModule {}

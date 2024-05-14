import { Module } from "@nestjs/common";
import { PatientsService } from "./service/patients.service";
import { PatientsController } from "./patients.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Patient } from "./entities/patient.entity";
import { EmployeesModule } from "@core/employees/employees.module";
import { Employee } from "@core/employees/entities/employee.entity";

import { EmployeesService } from "../employees/service/employees.service";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Patient, Employee])],
  controllers: [PatientsController],
  providers: [PatientsService, EmployeesService],
  exports: [PatientsService],
})
export class PatientsModule {}

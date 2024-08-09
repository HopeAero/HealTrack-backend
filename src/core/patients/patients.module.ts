import { Module } from "@nestjs/common";
import { PatientsService } from "./service/patients.service";
import { PatientsController } from "./patients.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Patient } from "./entities/patient.entity";
import { Employee } from "@core/employees/entities/employee.entity";
import { EmployeesService } from "../employees/service/employees.service";
import { UsersModule } from "../users/users.module";
import { ReportsModule } from "../reports/reports.module";
import { HospitalsModule } from "../employees/hospital.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    UsersModule,
    ReportsModule,
    HospitalsModule,
    NotificationsModule,
    TypeOrmModule.forFeature([Patient, Employee]),
  ],
  controllers: [PatientsController],
  providers: [PatientsService, EmployeesService],
  exports: [PatientsService, TypeOrmModule],
})
export class PatientsModule {}

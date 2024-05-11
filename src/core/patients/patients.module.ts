import { Module } from '@nestjs/common';
import { PatientsService } from './service/patients.service';
import { PatientsController } from './patients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { EmployeesModule } from '@core/employees/employees.module';
import { Employee } from '@core/employees/entities/employee.entity';
import { DbValidatorsModule } from '@youba/nestjs-dbvalidator';
import { envData } from '@src/config/typeorm';
import { EmployeesService } from '../employees/service/employees.service';

@Module({
  imports: [
    DbValidatorsModule.register({
      type: 'postgres',
      host: envData.DATABASE_HOST,
      port: parseInt(envData.DATABASE_PORT),
      username: envData.DATABASE_USERNAME,
      password: envData.DATABASE_PASSWORD,
      database: envData.DATABASE_NAME,
    }),
    TypeOrmModule.forFeature([Patient, Employee]),
  ],
  controllers: [PatientsController],
  providers: [
    PatientsService,
    EmployeesService,
  ],
  exports: [
    PatientsService,
  ],
})
export class PatientsModule {}

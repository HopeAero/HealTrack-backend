import { Module, forwardRef } from '@nestjs/common';
import { EmployeesService } from './service/employees.service';
import { EmployeesController } from './employees.controller';
import { Employee } from './entities/employee.entity';
import { DbValidatorsModule } from '@youba/nestjs-dbvalidator';
import { envData } from 'src/config/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsModule } from '../patients/patients.module';
import { Patient } from '@core/patients/entities/patient.entity';

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
    forwardRef(() => PatientsModule),
    TypeOrmModule.forFeature([Employee, Patient]),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}

import { Module } from '@nestjs/common';
import { PatientsService } from './service/patients.service';
import { PatientsController } from './patients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { EmployeesModule } from '@core/employees/employees.module';
import { Employee } from '@core/employees/entities/employee.entity';
import { DbValidatorsModule } from '@youba/nestjs-dbvalidator';
import { envData } from '@src/config/typeorm';

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
    EmployeesModule,
    TypeOrmModule.forFeature([Patient, Employee]),
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
})
export class PatientsModule {}

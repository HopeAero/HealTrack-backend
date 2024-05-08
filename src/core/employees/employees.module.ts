import { Module } from '@nestjs/common';
import { EmployeesService } from './service/employees.service';
import { EmployeesController } from './employees.controller';
import { Employee } from './entities/employee.entity';
import { DbValidatorsModule } from '@youba/nestjs-dbvalidator';
import { envData } from 'src/config/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

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
    TypeOrmModule.forFeature([Employee]),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}

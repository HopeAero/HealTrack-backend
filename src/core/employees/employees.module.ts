import { Module, forwardRef } from "@nestjs/common";
import { EmployeesService } from "./service/employees.service";
import { EmployeesController } from "./employees.controller";
import { Employee } from "./entities/employee.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "../users/users.module";
import { User } from "../users/entities/user.entity";

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Employee])],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}

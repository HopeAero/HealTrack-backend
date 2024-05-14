import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./service/auth.service";
import { JwtModule } from "@nestjs/jwt";
import { PatientsModule } from "../patients/patients.module";
import { EmployeesModule } from "../employees/employees.module";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    PatientsModule,
    EmployeesModule,
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "31d" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

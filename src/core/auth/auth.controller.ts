import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { AuthService } from "./service/auth.service";
import { ApiTags } from "@nestjs/swagger";
import { LoginDto } from "./dto/login.dto";
import { CreatePatientDto } from "../patients/dto/create-patient.dto";
import { CreateEmployeeDto } from "../employees/dto/create-employee.dto";
import { Auth } from "./decorator/auth.decorator";
import { Roles } from "./decorator/roles.decorator";
import { AllRole } from "@src/constants";
import { ActiveUser } from "@src/common/decorator/active-user-decorator";
import { UserActiveInterface } from "@src/common/interface/user-active-interface";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Auth(AllRole.ASSISTANT)
  @Post("register/patient")
  async registerPatient(@Body() createPatientDto: CreatePatientDto, @ActiveUser() user: UserActiveInterface) {
    return this.authService.registerPatient(createPatientDto, user);
  }

  @Auth(AllRole.ADMIN)
  @Post("register/employee")
  async registerEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.authService.registerEmployee(createEmployeeDto);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { AuthService } from "./service/auth.service";
import { ApiTags } from "@nestjs/swagger";
import { LoginDto } from "./dto/login.dto";
import { CreatePatientDto } from "../patients/dto/create-patient.dto";
import { CreateEmployeeDto } from "../employees/dto/create-employee.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("register/patient")
  async registerPatient(@Body() createPatientDto: CreatePatientDto) {
    return this.authService.registerPatient(createPatientDto);
  }

  @Post("register/employee")
  async registerEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.authService.registerEmployee(createEmployeeDto);
  }
}

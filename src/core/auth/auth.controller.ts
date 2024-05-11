import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { CreatePatientDto } from '../patients/dto/create-patient.dto';
import { CreateEmployeeDto } from '../employees/dto/create-employee.dto';


@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/patient')
  loginPatient(@Body() loginDto: LoginDto) {
    return this.authService.loginPatient(loginDto);
  }

  @Post('login/employee')
  loginEmployee(@Body() loginDto: LoginDto) {
    return this.authService.loginEmployee(loginDto);
  }

  @Post('register/patient')
  registerPatient(@Body() createPatientDto: CreatePatientDto) {
    return this.authService.registerPatient(createPatientDto);
  }

  @Post('register/employee')
  registerEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.authService.registerEmployee(createEmployeeDto);
  }

}

import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { EmployeesService } from "@core/employees/service/employees.service";
import { PatientsService } from "@core/patients/service/patients.service";
import { LoginDto } from "../dto/login.dto";
import * as bcryptjs from "bcryptjs";
import { CreateEmployeeDto } from "@src/core/employees/dto/create-employee.dto";
import { AllRole } from "@src/constants";
import { CreatePatientDto } from "@src/core/patients/dto/create-patient.dto";
import { UsersService } from "@src/core/users/service/users.service";
import { envData } from "@src/config/typeorm";

@Injectable()
export class AuthService {
  constructor(
    private readonly patientService: PatientsService,

    private readonly employeeService: EmployeesService,

    private readonly userService: UsersService,

    private readonly jwtService: JwtService,
  ) {}

  async login({ email, password }: LoginDto) {
    const user = await this.userService.getByEmail(email);

    if (!user) {
      throw new UnauthorizedException("correo no encontrado");
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("contraseña incorrecta");
    }

    const payload = { email: user.email, id: user.id, role: user.role };
    const token = await this.jwtService.signAsync(payload, { secret: process.env.JWT_SECRET });

    return {
      token,
      email,
      id: user.id,
      role: user.role,
    };
  }

  async registerPatient(createPatientDto: CreatePatientDto) {
    const user = await this.userService.getByEmail(createPatientDto.user.email);

    if (user) {
      throw new BadRequestException("correo ya registrado");
    }

    const password = await bcryptjs.hash(createPatientDto.user.password, 10);

    const patient = await this.patientService.create({
      ...createPatientDto,
      user: { ...createPatientDto.user, password, role: AllRole.PATIENT },
    });

    return {
      email: patient.email,
      name: patient.name,
      lastname: patient.lastname,
      id: patient.id,
      role: AllRole.PATIENT,
    };
  }

  async registerEmployee(createEmployeeDto: CreateEmployeeDto) {
    const user = await this.userService.getByEmail(createEmployeeDto.user.email);

    if (user) {
      throw new BadRequestException("correo ya registrado");
    }

    const password = await bcryptjs.hash(createEmployeeDto.user.password, 10);

    const employee = await this.employeeService.create({
      ...createEmployeeDto,
      user: { ...createEmployeeDto.user, password },
    });

    return {
      email: employee.email,
      name: employee.name,
      lastname: employee.lastname,
      id: employee.id,
      role: employee.role,
    };
  }

  public async getUserFromAuthenticationToken(token: string) {
    const payload = this.jwtService.verify(token, {
      secret: envData.SECRET,
    });

    if (payload.id) {
      return this.userService.findOne(payload.id);
    }
  }
}

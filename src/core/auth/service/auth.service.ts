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

@Injectable()
export class AuthService {
  constructor(
    private readonly patientService: PatientsService,

    private readonly employeeService: EmployeesService,

    private readonly userService: UsersService,

    private readonly jwtService: JwtService,
  ) {}

  async loginPatient({ email, password }: LoginDto) {
    const user = await this.userService.getByEmail(email);

    if (!user) {
      throw new UnauthorizedException("correo no encontrado");
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("contraseña incorrecta");
    }

    const payload = { email: user.email, id: user.id, role: "patient" };
    const token = await this.jwtService.signAsync(payload, { secret: process.env.JWT_SECRET });

    return {
      token,
      email,
      id: user.id,
      role: "patient",
    };
  }

  async loginEmployee({ email, password }: LoginDto) {
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
}

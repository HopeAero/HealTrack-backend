import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmployeesService } from '@core/employees/service/employees.service';
import { PatientsService } from '@core/patients/service/patients.service';
import { LoginDto } from '../dto/login.dto';
import * as bcryptjs from 'bcryptjs';
import { JwtPayloadService } from '@src/common/service/jwt.payload.service';
import { CreateEmployeeDto } from '@src/core/employees/dto/create-employee.dto';
import { AllRole, EmployeeRole } from '@src/constants';
import { CreatePatientDto } from '@src/core/patients/dto/create-patient.dto';


@Injectable()
export class AuthService {
  constructor(
    private readonly patientService: PatientsService,

    private readonly employeeService: EmployeesService,

    private readonly jwtService: JwtService,

) {}

    async loginPatient({ email, password }: LoginDto) {
          
          const user = await this.patientService.getByEmail(email);
  
          if (!user) {
            throw new UnauthorizedException('correo no encontrado');
          }
  
          const isPasswordValid = await bcryptjs.compare(password, user.password);
  
        if (!isPasswordValid) {
          throw new UnauthorizedException('contraseña incorrecta');
        }
  
        const payload = { email: user.email, id: user.id, role: "patient"};
        const token = await this.jwtService.signAsync(payload, {secret: process.env.JWT_SECRET});

        return {
          token,
          email,
          id: user.id,
          role: "patient",
        }
    }


    async loginEmployee({ email, password }: LoginDto) {
        
      const user = await this.employeeService.getByEmail(email);

      if (!user) {
        throw new UnauthorizedException('correo no encontrado');
      }

      const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('contraseña incorrecta');
    }

    const payload = { email: user.email, id: user.id, role: user.role };
    const token = await this.jwtService.signAsync(payload, {secret: process.env.JWT_SECRET});


    return {
      token,
      email,
      id: user.id,
      role: user.role,
    }
  }

  async registerEmployee({ email, password, name, hospital, identification, lastname, role }: CreateEmployeeDto) {
    const user = await this.employeeService.getByEmail(email);

    if (user) {
        throw new BadRequestException('User already exists');
    }

    await this.employeeService.create({
        email,
        password,
        name,
        hospital,
        identification,
        lastname,
        role: role
    });

    return {
        email,
        name,
        lastname,
        role,
    }
}

async registerPatient(createPatientDto: CreatePatientDto) {
  const user = await this.patientService.getByEmail(createPatientDto.email);

    if (user) {
      throw new BadRequestException('User already exists');
    }

    await this.patientService.create(createPatientDto);

    return {
      email: createPatientDto.email,
      name: createPatientDto.name,
      lastname: createPatientDto.lastname,
      role : AllRole.PATIENT
    }
  
  }

}

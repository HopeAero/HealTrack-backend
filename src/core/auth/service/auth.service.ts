import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmployeesService } from '@core/employees/service/employees.service';
import { PatientsService } from '@core/patients/service/patients.service';
import { LoginDto } from '../dto/login.dto';
import * as bcryptjs from 'bcryptjs';


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
  
        const payload = { email: user.email, id: user.id};
        const token = await this.jwtService.signAsync(payload, {secret: process.env.JWT_SECRET});

        return {
          token,
          email,
          id: user.id,
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
    }
  }
  
}

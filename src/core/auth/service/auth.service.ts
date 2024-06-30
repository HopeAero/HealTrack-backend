import { Repository } from "typeorm";
import * as bcryptjs from "bcryptjs";
import { AllRole } from "@src/constants";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "../dto/login.dto";
import { envData } from "@src/config/typeorm";
import { plainToClass } from "class-transformer";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "@src/core/users/entities/user.entity";
import { Chat } from "@src/core/chats/entities/chat.entity";
import { StatusPatient } from "@src/constants/status/statusPatient";
import { UsersService } from "@src/core/users/service/users.service";
import { PatientsService } from "@core/patients/service/patients.service";
import { CreatePatientDto } from "@src/core/patients/dto/create-patient.dto";
import { EmployeesService } from "@core/employees/service/employees.service";
import { CreateEmployeeDto } from "@src/core/employees/dto/create-employee.dto";
import { UserActiveInterface } from "@src/common/interface/user-active-interface";
import { BadRequestException, Injectable, UnauthorizedException, ForbiddenException } from "@nestjs/common";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
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

    if (user.role === AllRole.PATIENT && user.patient?.status !== StatusPatient.ACTIVE) {
      throw new ForbiddenException("El usuario se encuentra hospitalizado o dado de alta.");
    }

    const payload = { email: user.email, id: user.id, role: user.role };
    const token = await this.jwtService.signAsync(payload, { secret: process.env.JWT_SECRET });

    return {
      token,
      email,
      id: user.id,
      role: user.role,
      name: user.name,
      lastname: user.lastname,
      employee: user.employee?.id,
      patient: user.patient?.id,
    };
  }
  async registerPatient(createPatientDto: CreatePatientDto, user: UserActiveInterface) {
    const userExist = await this.userService.getByEmail(createPatientDto.user.email);

    if (userExist) {
      throw new BadRequestException("correo ya registrado");
    }

    if (user.role !== AllRole.ASSISTANT) {
      throw new ForbiddenException("El usuario no tiene permisos para registrar pacientes");
    }

    const password = await bcryptjs.hash(createPatientDto.user.password, 10);

    const patient = await this.patientService.create({
      ...createPatientDto,
      asistant: user.id,
      user: { ...createPatientDto.user, password, role: AllRole.PATIENT },
    });

    if (!!patient) {
      const chatPayload = {
        users: [
          {
            id: patient.id,
          } as unknown as User,
          {
            id: user.id,
          } as unknown as User,
        ],
        title: "chat",
      };

      const users = [];
      for (const { id } of chatPayload?.users) {
        const user = await this.userService.findOne(id);
        users.push(user);
      }

      const createdChat = this.chatRepo.create({
        ...plainToClass(Chat, chatPayload),
        users,
        created_by: user,
      });
      await this.chatRepo.save(createdChat);
    }

    return {
      email: patient.email,
      name: patient.name,
      lastname: patient.lastname,
      id: patient.id,
      role: AllRole.PATIENT,
    };
  }

  async registerEmployee(createEmployeeDto: CreateEmployeeDto) {
    const userExist = await this.userService.getByEmail(createEmployeeDto.user.email);

    if (userExist) {
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

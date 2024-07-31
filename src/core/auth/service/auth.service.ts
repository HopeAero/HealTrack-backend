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
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { UpdatePasswordDto } from "../dto/update-password.dto";
import { MailerService } from "@nestjs-modules/mailer";

export type SendEmailDto = {
  sender?: string;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,

    private readonly patientService: PatientsService,

    @InjectRepository(User) private userRepo: Repository<User>,

    private readonly employeeService: EmployeesService,

    private readonly userService: UsersService,

    private readonly jwtService: JwtService,

    private mailerService: MailerService,
  ) {}

  //Funcion de Login
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

  //Funcion de Registro de paciente
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

  //Funcion de Registro de empleado
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

  //Funcion de obtencion de token al usuario
  public async getUserFromAuthenticationToken(token: string) {
    const payload = this.jwtService.verify(token, {
      secret: envData.SECRET,
    });

    if (payload.id) {
      return this.userService.findOne(payload.id);
    }
  }

  //Funcion de cambio de contraseña
  async changePassword(userEmail: string, updatePasswordDto: UpdatePasswordDto) {
    const { currentPassword, newPassword } = updatePasswordDto;

    const usuario = await this.userRepo.findOne({
      where: { email: userEmail },
    });

    // Usar el repositorio de User para obtener el usuario con la contraseña
    const user = await this.userRepo.findOne({
      where: { email: userEmail },
      select: ["password"], // Asegurarse de seleccionar la contraseña
    });

    if (!user) {
      throw new NotFoundException("Usuario no encontrado");
    }

    const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException("Contraseña actual incorrecta");
    }

    const hashedNewPassword = await bcryptjs.hash(newPassword, 10);

    user.password = hashedNewPassword;

    const updatedUser = { ...usuario, password: hashedNewPassword };

    await this.userRepo.save(updatedUser);

    return { message: "Contraseña actualizada correctamente" };
  }

  //Enviar correo para recuperar contraseña al email
  async sendResetPasswordEmail(userEmail: string) {
    const user = await this.userRepo.findOne({
      where: { email: userEmail },
      select: ["email"], // Asegurarse de seleccionar el email
    });

    if (!user) {
      throw new BadRequestException("Usuario no encontrado");
    }

    const token = this.jwtService.sign({ email: user.email }, { expiresIn: "1h" });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    console.log(resetUrl);

    await this.mailerService.sendMail({
      to: userEmail,
      subject: "Restablecer tu contraseña",
      html: `<p>Hola,</p>
           <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
           <a href="${resetUrl}">Restablecer Contraseña</a>
           <p>Si no solicitaste este cambio, por favor ignora este correo.</p>`,
    });
  }

  //Restablecer contraseña al email
  async resetPassword(token: string, newPassword: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new BadRequestException("Token inválido o expirado");
    }

    const usuario = await this.userRepo.findOne({
      where: { email: payload.email },
    });

    if (!usuario) {
      throw new NotFoundException("Usuario no encontrado");
    }

    const hashedNewPassword = await bcryptjs.hash(newPassword, 10);

    const updatedUser = { ...usuario, password: hashedNewPassword };

    await this.userRepo.save(updatedUser);

    return { message: "Contraseña restablecida correctamente" };
  }
}

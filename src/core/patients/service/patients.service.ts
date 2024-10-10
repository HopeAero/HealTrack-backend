import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { UpdatePatientStateDto } from "../dto/update-patient-state.dto";
import { CreatePatientDto } from "../dto/create-patient.dto";
import { UpdatePatientDto } from "../dto/update-patient.dto";
import { Patient } from "../entities/patient.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Equal, Repository } from "typeorm";
import { ReportsService } from "@src/core/reports/service/reports.service";
import { Employee } from "@src/core/employees/entities/employee.entity";
import { UsersService } from "@src/core/users/service/users.service";
import { AllRole } from "@src/constants";
import { StatusPatient } from "@src/constants/status/statusPatient";
import { User } from "@src/core/users/entities/user.entity";
import { Hospital } from "@src/core/employees/entities/hospital.entity";
import { NotificationsService } from "@src/core/notifications/service/notifications.service";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(Hospital)
    private readonly hospitalRepository: Repository<Hospital>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private dataSource: DataSource,

    private readonly userService: UsersService,

    private readonly reportService: ReportsService,

    private readonly notificationsService: NotificationsService,

    private mailerService: MailerService,
  ) {}

  async create(createPatientDto: CreatePatientDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const exists = await this.numberPhoneExists(createPatientDto.personalPhone);

      if (exists) {
        throw new BadRequestException("Ya existe un paciente con este numero de telefono personal");
      }

      // Verificar si el hospital existe
      const hospital = await this.hospitalRepository.findOne({
        where: {
          name: createPatientDto.hospital.name,
        },
      });

      if (!hospital) {
        throw new NotFoundException("No se encontro el hospital con el Name proporcionado");
      }

      const employee = await this.employeeRepository.findOne({
        where: {
          id: createPatientDto.medicId,
        },
        relations: ["user"],
      });

      const asistant = await this.employeeRepository.findOne({
        where: {
          user: { id: createPatientDto.asistant },
        },
      });

      if (!employee) {
        throw new NotFoundException("No se encontro el medico con el id proporcionado");
      }

      if (employee.user.role !== AllRole.SPECIALIST) {
        throw new BadRequestException("El empleado no es un medico");
      }

      if (createPatientDto.user.role !== AllRole.PATIENT) {
        throw new BadRequestException("El rol del usuario no es valido");
      }

      if (!asistant) {
        throw new NotFoundException("No se encontro el asistente con el id proporcionado");
      }

      const { user, ...data } = createPatientDto;

      const patient = new Patient();
      patient.medic = employee;
      patient.personalPhone = createPatientDto.personalPhone;
      patient.homePhone = createPatientDto.homePhone;
      patient.address = createPatientDto.address;
      patient.age = createPatientDto.age;
      patient.sex = createPatientDto.sex;
      patient.hospital = createPatientDto.hospital;
      patient.surgeryDate = createPatientDto.surgeryDate;
      patient.surgeryProcedure = createPatientDto.surgeryProcedure;
      patient.surgeryType = createPatientDto.surgeryType;
      patient.automaticTracking = createPatientDto.automaticTracking;
      patient.status = createPatientDto.status;
      patient.asistant = asistant;

      await queryRunner.manager.save(Patient, patient);

      const userCreate = await queryRunner.manager.save(User, { ...user, patient: patient });

      await queryRunner.commitTransaction();

      return userCreate;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(status?: StatusPatient) {
    const whereCondition = status ? { status } : {};
    return await this.patientRepository.find({
      where: whereCondition,
      relations: ["medic", "asistant", "user"],
      order: {
        id: "ASC",
      },
    });
  }

  async findAll_No_Status() {
    return await this.patientRepository.find({
      relations: ["medic", "asistant", "user"],
      order: {
        id: "ASC",
      },
    });
  }

  async find_10_newest() {
    return await this.patientRepository.find({
      where: {
        user: {
          deletedAt: null,
        },
      },
      relations: ["user"],
      order: {
        user: {
          createdAt: "DESC",
        },
      },
      take: 10,
    });
  }

  async findOne(id: number) {
    const found = await this.patientRepository.findOne({ where: { id: Equal(id) }, relations: ["medic", "user"] });

    if (!found) {
      throw new NotFoundException(`Paciente con el ID ${id} no fue encontrado`);
    }

    const patientReports = await this.reportService.findByUser(found.user.id);

    return { ...found, patientReports };
  }

  async findOneByUserId(idUser: number) {
    const found = await this.patientRepository.findOne({
      where: { user: { id: idUser } },
      relations: ["user"],
    });

    if (!found) {
      throw new NotFoundException(`Paciente con el ID ${idUser} no fue encontrado`);
    }

    return found;
  }

  async findByEmployee(employeeId: number, status?: StatusPatient) {
    const whereCondition = status
      ? [
          { medic: { id: employeeId }, status },
          { asistant: { id: employeeId }, status },
        ]
      : [{ medic: { id: employeeId } }, { asistant: { id: employeeId } }];

    return await this.patientRepository.find({
      where: whereCondition,
      relations: ["medic", "asistant", "user"],
      order: {
        id: "ASC",
      },
    });
  }

  async update(id: number, updatePatientDto: UpdatePatientDto) {
    try {
      const patient = await this.findOne(id);

      const { user, ...data } = updatePatientDto;
      const { medicId, ...dataObj } = data;

      if (!patient) {
        throw new NotFoundException(`Paciente con el ID ${id} no fue encontrado`);
      }

      if (updatePatientDto.hospital.name) {
        // Verificar si el hospital existe
        const hospital = await this.hospitalRepository.findOne({
          where: {
            name: updatePatientDto.hospital.name,
          },
        });

        if (!hospital) {
          throw new NotFoundException("No se encontro el hospital con el Nombre proporcionado");
        }
      }

      if (updatePatientDto.medicId) {
        const employee = await this.employeeRepository.findOne({
          where: {
            id: updatePatientDto.medicId,
          },
        });

        if (!employee) {
          throw new NotFoundException("No se encontro el medico con el id proporcionado");
        }

        await this.patientRepository.update(id, { ...dataObj, medic: employee });
      }

      // Actualizar los datos del usuario si es necesario
      if (user) {
        await this.userService.update(patient.user.id, user);
      }

      return true;
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async updateState(id: number, updatePatientDto: UpdatePatientStateDto) {
    try {
      const patient = await this.findOne(id);

      if (!patient) {
        throw new NotFoundException(`Paciente con el ID ${id} no fue encontrado`);
      }

      await this.patientRepository.update(id, updatePatientDto);

      return true;
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async remove(id: number) {
    const patient = await this.findOne(id);

    if (!patient) {
      throw new NotFoundException(`Paciente con el ID ${id} no fue encontrado`);
    }

    await this.patientRepository.softDelete(id);
    await this.userService.remove(patient.user.id);
  }

  //Otras funciones
  private async getByNumberPhone(personalPhone: string) {
    const patient = await this.patientRepository.findOne({
      where: {
        personalPhone,
      },
    });

    return patient;
  }

  private async getByNumberPhoneHome(homePhone: string) {
    const patient = await this.patientRepository.findOne({
      where: {
        homePhone,
      },
    });

    return patient;
  }

  async numberPhoneExists(phone: string) {
    const personalHome = await this.getByNumberPhone(phone);
    const phoneHome = await this.getByNumberPhoneHome(phone);

    if (personalHome || phoneHome) {
      return true;
    }

    return false;
  }

  // Añadimos la función para obtener el nombre del médico
  async getMedicNameByPatient(patientId: number): Promise<string> {
    // Encontrar al paciente por ID
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
      relations: ["asistant", "asistant.user"], // Relacionar con asistente y usuario del asistente
    });

    if (!patient) {
      throw new NotFoundException(`Paciente con el ID ${patientId} no fue encontrado`);
    }

    // Verificar si el paciente tiene un asistente asignado
    const asistant = patient.asistant;
    if (!asistant) {
      return "No asignado";
    }

    // Verificar el rol del asistente
    const user = asistant.user;
    if (user.role !== AllRole.ASSISTANT) {
      return "Asistente no válido";
    }

    // Retornar el nombre completo del asistente
    return user ? `${user.name} ${user.lastname}` : "No asignado";
  }

  // Función de botón de pánico
  async handlePanicButton(userId: number): Promise<void> {
    // Buscar al paciente utilizando el ID del usuario
    const patient = await this.patientRepository.findOne({
      where: { user: { id: userId } },
      relations: ["user", "medic", "medic.user", "asistant", "asistant.user"],
    });

    if (!patient) {
      throw new NotFoundException(`Paciente con el ID de usuario ${userId} no fue encontrado`);
    }

    // Obtener información del paciente
    const { user, address, personalPhone, homePhone, hospital } = patient;
    const patientName = `${user.name} ${user.lastname}`;
    const patientEmail = user.email;
    const patientIdentification = user.identification;

    // Crear el mensaje de la notificación
    const message = `
      Alerta de emergencia: El paciente ${patientName} (ID: ${patient.id}) ha activado el botón de pánico.
      Información del paciente:
      - Nombre: ${patientName}
      - Email: ${patientEmail}
      - Identificación: ${patientIdentification}
      - Dirección: ${address}
      - Teléfono personal: ${personalPhone}
      - Teléfono de casa: ${homePhone}
      - Hospital: ${hospital.name}
    `;

    const assistantEmail = patient.asistant.user.email;
    const medicEmail = patient.medic.user.email;
    const titulo = "Alerta de Emergencia. Paciente: " + patientName;

    const mail_html = `<p>Alerta de emergencia: El paciente ${patientName} (ID: ${patient.id}) ha activado el botón de pánico.</p>
                    <p>Información del paciente:</p>
                    <p></p>
                    <p>- Nombre: ${patientName}</p>
                    <p>- Email: ${patientEmail}</p>
                    <p>- Identificación: ${patientIdentification}</p>
                    <p>- Dirección: ${address}</p>
                    <p>- Teléfono personal: ${personalPhone}</p>
                    <p>- Teléfono de casa: ${homePhone}</p>
                    <p>- Hospital: ${hospital.name}</p>
                    `;

    // Enviar notificación al enfermero
    if (patient.asistant) {
      await this.notificationsService.create({
        title: titulo,
        message,
        employeeId: patient.asistant.id,
        patientId: patient.id,
      });

      await this.mailerService.sendMail({
        to: assistantEmail,
        subject: titulo,
        html: mail_html,
      });
    }

    // Enviar notificación al especialista
    if (patient.medic) {
      await this.notificationsService.create({
        title: titulo,
        message,
        employeeId: patient.medic.id,
        patientId: patient.id,
      });

      await this.mailerService.sendMail({
        to: medicEmail,
        subject: titulo,
        html: mail_html,
      });
    }
  }
}

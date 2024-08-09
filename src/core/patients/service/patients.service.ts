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

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(Hospital) // Inyectar el repositorio de Hospital
    private readonly hospitalRepository: Repository<Hospital>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private dataSource: DataSource,

    private readonly userService: UsersService,

    private readonly reportService: ReportsService,

    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createPatientDto: CreatePatientDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      console.log(createPatientDto);

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

  async findOne(id: number) {
    const found = await this.patientRepository.findOne({ where: { id: Equal(id) }, relations: ["medic", "user"] });

    if (!found) {
      throw new NotFoundException(`Paciente con el ID ${id} no fue encontrado`);
    }

    const patientReports = await this.reportService.findByUser(found.user.id);

    return { ...found, patientReports };
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

        return await this.patientRepository.update(id, { ...dataObj, medic: employee });
      }

      await this.patientRepository.update(id, dataObj);

      if (updatePatientDto.user) {
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

  // Funcion de boton de panico
  async handlePanicButton(patientId: number): Promise<void> {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
      relations: ["user", "medic", "medic.user", "asistant", "asistant.user"],
    });

    if (!patient) {
      throw new NotFoundException(`Paciente con el ID ${patientId} no fue encontrado`);
    }

    // Obtener información del paciente
    const { user, address, personalPhone, homePhone, hospital } = patient;
    const patientName = `${user.name} ${user.lastname}`;
    const patientEmail = user.email;
    const patientIdentification = user.identification;

    // Crear el mensaje de la notificación
    const message = `
      Alerta de emergencia: El paciente ${patientName} (ID: ${patientId}) ha activado el botón de pánico.
      Información del paciente:
      - Nombre: ${patientName}
      - Email: ${patientEmail}
      - Identificación: ${patientIdentification}
      - Dirección: ${address}
      - Teléfono personal: ${personalPhone}
      - Teléfono de casa: ${homePhone}
      - Hospital: ${hospital.name}
    `;

    // Enviar notificación al enfermero
    if (patient.asistant) {
      await this.notificationsService.create({
        title: "Alerta de Emergencia",
        message,
        employeeId: patient.asistant.id,
      });
    }

    // Enviar notificación al especialista
    if (patient.medic) {
      await this.notificationsService.create({
        title: "Alerta de Emergencia",
        message,
        employeeId: patient.medic.id,
      });
    }
  }
}

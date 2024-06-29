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

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private dataSource: DataSource,
    private readonly userService: UsersService,
    private readonly reportService: ReportsService,
  ) {}

  async create(createPatientDto: CreatePatientDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const employee = await this.employeeRepository.findOne({
        where: {
          id: createPatientDto.medicId,
        },
        relations: ["user"],
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

      await queryRunner.manager.save(Patient, patient);

      const userCreate = await queryRunner.manager.save(User, { ...user, patient: patient });

      await queryRunner.commitTransaction();

      return userCreate;
    } catch (error) {
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
      relations: ["medic", "user"],
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
    const whereCondition = status ? { medic: { id: employeeId }, status } : { medic: { id: employeeId } };
    return this.patientRepository.find({
      where: whereCondition,
      relations: ["medic", "user"],
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

      const exists = await this.numberPhoneExists(updatePatientDto.personalPhone);
      const existsHome = await this.numberPhoneExists(updatePatientDto.homePhone);

      if (exists) {
        throw new BadRequestException("Ya existe un paciente con este numero de telefono personal");
      }

      if (existsHome) {
        throw new BadRequestException("Ya existe un paciente con este numero de telefono de casa");
      }

      if (!patient) {
        throw new NotFoundException(`Paciente con el ID ${id} no fue encontrado`);
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

      const updatedPatient = await this.patientRepository.update(id, dataObj);

      if (updatePatientDto.user) {
        const isback = await this.userService.update(patient.user.id, user);
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
}

import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreatePatientDto } from "../dto/create-patient.dto";
import { UpdatePatientDto } from "../dto/update-patient.dto";
import { Patient } from "../entities/patient.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcryptjs from "bcryptjs";
import { Employee } from "@src/core/employees/entities/employee.entity";
import { EmployeeRole } from "@src/constants";
import { EmployeesService } from "@src/core/employees/service/employees.service";

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    private readonly employeeService: EmployeesService,
  ) {}

  async create(createPatientDto: CreatePatientDto) {
    const employee = await this.employeeRepository.findOne({
      where: {
        id: createPatientDto.medicId,
      },
    });

    if (!employee) {
      throw new NotFoundException("No se encontro el medico con el id proporcionado");
    }

    const exists = await this.numberPhoneExists(createPatientDto.personalPhone);
    const existsHome = await this.numberPhoneExists(createPatientDto.homePhone);

    if (exists) {
      throw new BadRequestException("Ya existe un paciente con este numero de telefono personal");
    }

    if (existsHome) {
      throw new BadRequestException("Ya existe un paciente con este numero de telefono de casa");
    }

    const patient = this.patientRepository.create({
      ...createPatientDto,
      medic: employee,
    });

    await this.patientRepository.save(patient);

    return patient;
  }

  async findAll() {
    return await this.patientRepository.find({
      relations: ["medic"],
    });
  }

  async findOne(id: number) {
    const found = await this.patientRepository.findOne({ where: { id }, relations: ["medic"] });

    if (!found) {
      throw new NotFoundException(`Paciente con el ID ${id} no fue encontrado`);
    }

    return found;
  }

  async update(id: number, updatePatientDto: UpdatePatientDto) {
    const patient = await this.findOne(id);

    if (!patient) {
      throw new NotFoundException(`Paciente con el ID ${id} no fue encontrado`);
    }

    if (updatePatientDto.personalPhone) {
      const exists = await this.numberPhoneExists(updatePatientDto.personalPhone);

      if (exists) {
        throw new BadRequestException("Ya existe un paciente con este numero de telefono personal");
      }
    }

    if (updatePatientDto.homePhone) {
      const exists = await this.numberPhoneExists(updatePatientDto.homePhone);

      if (exists) {
        throw new BadRequestException("Ya existe un paciente con este numero de telefono de casa");
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

      return await this.patientRepository.update(id, { ...updatePatientDto, medic: employee });
    }

    const updatedPatient = await this.patientRepository.update(id, updatePatientDto);

    return updatedPatient;
  }

  async remove(id: number) {
    const patient = await this.findOne(id);

    if (!patient) {
      throw new NotFoundException(`Paciente con el ID ${id} no fue encontrado`);
    }

    await this.patientRepository.softDelete(id);
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

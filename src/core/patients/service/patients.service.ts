import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { UpdatePatientDto } from '../dto/update-patient.dto';
import { Patient } from '../entities/patient.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { Employee } from '@src/core/employees/entities/employee.entity';


@Injectable()
export class PatientsService {

  constructor(
    @InjectRepository(Patient) 
    private readonly patientRepository: Repository<Patient>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>
    
  ) {
  }

  async create(createPatientDto: CreatePatientDto) {
    const employee = await this.employeeRepository.findOne({
      where: {
        id: createPatientDto.medicId
      }
    });

    if (!employee) {
      throw new NotFoundException('No se encontro el medico con el id proporcionado');
    }

    const patient = this.patientRepository.create({...createPatientDto, password: await bcryptjs.hash(createPatientDto.password, 10), medic: employee});


    await this.patientRepository.save(patient);

    return patient;
  }

  async findAll() {
    return await this.patientRepository.find();
  }

  async findOne(id: number) {
    const found = await this.patientRepository.findOne({ where: { id } });

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
}

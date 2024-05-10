import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { Employee } from '../entities/employee.entity';
import { Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { PatientsService } from '@src/core/patients/service/patients.service';
import { Patient } from '@src/core/patients/entities/patient.entity';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee) 
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    
  ) {
  }
  async create(createEmployeeDto: CreateEmployeeDto) {

    const exists = await this.getByIdentification(createEmployeeDto.identification);
    const exist2 = await this.patientRepository.findOne({where: {identification: createEmployeeDto.identification}});
    
    if (exists || exist2) {
      throw new NotFoundException('Ya existe una persona con esta identificacion');
    }

    let employee = await this.employeeRepository.create({...createEmployeeDto, password: await bcryptjs.hash(createEmployeeDto.password, 10)});
    await this.employeeRepository.save(employee);
    return employee;
  }

  async findAll() {
    return await this.employeeRepository.find();
  }

  async findOne(id: number) {
    const found = await this.employeeRepository.findOne({ where: { id } });

    if (!found) {
      throw new NotFoundException(`Empleado con el ID ${id} no fue encontrado`);
    }

    return found;
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.findOne(id);

    const exist1 = await this.getByIdentification(updateEmployeeDto.identification);
    const exist2 = await this.patientRepository.findOne({where: {identification: updateEmployeeDto.identification}});

    if (exist1 || exist2) {
      throw new NotFoundException('Ya existe una persona con esta identificacion');
    }

    if (!employee) {
      throw new NotFoundException(`Empleado con el ID ${id} no fue encontrado`);
    }

    const updatedEmployee = await this.employeeRepository.update(id, updateEmployeeDto);

    return updatedEmployee;
  }

  async remove(id: number) {
    const employee = await this.findOne(id);

    if (!employee) {
      throw new NotFoundException(`Empleado con el ID ${id} no fue encontrado`);
    }

    await this.employeeRepository.softDelete(id);
  }

  async getByEmail(email: string) {
    const employee = await this.employeeRepository.findOne({
      where: {
        email
      }
    })

    return employee
  }

  async getByIdentification(identification: string) {
    const employee = await this.employeeRepository.findOne({
      where: {
        identification
      }
    })

    return employee
  }

}

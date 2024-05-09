import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { Employee } from '../entities/employee.entity';
import { Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee) 
    private readonly employeeRepository: Repository<Employee>
  ) {
  }
  async create(createEmployeeDto: CreateEmployeeDto) {
    const employee = await this.employeeRepository.create(createEmployeeDto);
    createEmployeeDto.password = await bcryptjs.hash(createEmployeeDto.password, 10);
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
}

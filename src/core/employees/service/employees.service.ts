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
      throw new NotFoundException(`Employee with ID "${id}" not found`);
    }

    return found;
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.findOne(id);
    const updatedEmployee = await this.employeeRepository.save({
      ...employee,
      ...updateEmployeeDto,
    });

    return updatedEmployee;
  }

  async remove(id: number) {
    const employee = await this.findOne(id);
    await this.employeeRepository.softDelete(employee);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, Response } from '@nestjs/common';
import { EmployeesService } from './service/employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ApiTags } from '@nestjs/swagger';
import * as express from 'express';


@ApiTags('employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  async findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.employeesService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto, @Response() response: express.Response,) {
    await this.employeesService.update(+id, updateEmployeeDto);

    return response.status(200).json({
      message: "Se ha modificado correctamente el empleado"
    })
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Response() response: express.Response,) {
    await this.employeesService.remove(+id);

    return response.status(200).json({
      message: "Se ha eliminado correctamente el empleado"
    })

  }
}

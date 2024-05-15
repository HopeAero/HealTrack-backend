import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { CreateEmployeeDto } from "../dto/create-employee.dto";
import { UpdateEmployeeDto } from "../dto/update-employee.dto";
import { Employee } from "../entities/employee.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersService } from "@src/core/users/service/users.service";
import { AllRole } from "@src/constants";
import * as bcryptjs from "bcryptjs";

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    private readonly userService: UsersService,
  ) {}
  async create(createEmployeeDto: CreateEmployeeDto) {
    if (
      createEmployeeDto.user.role !== AllRole.SPECIALIST &&
      createEmployeeDto.user.role !== AllRole.ADMIN &&
      createEmployeeDto.user.role !== AllRole.ASSISTANT
    ) {
      throw new NotFoundException("El rol del empleado no es valido");
    }

    const employee = new Employee();
    employee.hospital = createEmployeeDto.hospital;

    await this.employeeRepository.save(employee);

    return await this.userService.create({
      ...createEmployeeDto.user,
      employee: employee,
    });
  }

  async findAll() {
    return await this.employeeRepository.find({
      relations: ["user"],
    });
  }

  async findOne(id: number) {
    const found = await this.employeeRepository.findOne({ where: { id }, relations: ["user"] });

    if (!found) {
      throw new NotFoundException(`Empleado con el ID ${id} no fue encontrado`);
    }

    return found;
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    try {
      const employee = await this.findOne(id);

      if (!employee) {
        throw new NotFoundException(`Empleado con el ID ${id} no fue encontrado`);
      }

      if (updateEmployeeDto.user) {
        if (updateEmployeeDto.user.role) {
          if (
            updateEmployeeDto.user.role !== AllRole.SPECIALIST &&
            updateEmployeeDto.user.role !== AllRole.ADMIN &&
            updateEmployeeDto.user.role !== AllRole.ASSISTANT
          ) {
            throw new BadRequestException("El rol del empleado no es valido");
          }
        }
      }

      if (updateEmployeeDto.user) {
        const isback = await this.userService.update(employee.user.id, updateEmployeeDto.user);
      }

      let { hospital, ...rest } = updateEmployeeDto;

      const updatedEmployee = await this.employeeRepository.update(id, { hospital: hospital });

      return updatedEmployee;
    } catch (error) {
      console.log(error);
      throw new HttpException(`Error interno ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number) {
    const employee = await this.findOne(id);

    if (!employee) {
      throw new NotFoundException(`Empleado con el ID ${id} no fue encontrado`);
    }

    await this.employeeRepository.softDelete(id);
    await this.userService.remove(employee.user.id);

    return true;
  }
}

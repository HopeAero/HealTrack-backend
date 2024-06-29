import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { CreateEmployeeDto } from "../dto/create-employee.dto";
import { UpdateEmployeeDto } from "../dto/update-employee.dto";
import { Employee } from "../entities/employee.entity";
import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersService } from "@src/core/users/service/users.service";
import { AllRole } from "@src/constants";
import * as bcryptjs from "bcryptjs";
import { User } from "@src/core/users/entities/user.entity";

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private dataSource: DataSource,
    private readonly userService: UsersService,
  ) {}
  async create(createEmployeeDto: CreateEmployeeDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (
        createEmployeeDto.user.role !== AllRole.SPECIALIST &&
        createEmployeeDto.user.role !== AllRole.ADMIN &&
        createEmployeeDto.user.role !== AllRole.ASSISTANT
      ) {
        throw new NotFoundException("El rol del empleado no es valido");
      }

      const employee = new Employee();
      employee.hospital = createEmployeeDto.hospital;

      await queryRunner.manager.save(Employee, employee);

      const userCreate = await queryRunner.manager.save(User, { ...createEmployeeDto.user, employee: employee });

      await queryRunner.commitTransaction();

      return userCreate;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(`Error interno ${error.message}`, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.employeeRepository.find({
      relations: ["user"],
      order: {
        id: "ASC",
      },
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

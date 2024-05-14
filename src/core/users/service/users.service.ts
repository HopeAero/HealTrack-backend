import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { User } from "../entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    return await this.userRepository.save(createUserDto);
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con este id ${id} no fue encontrado`);
    }

    if (updateUserDto.email) {
      const userExist = await this.userRepository.findOne({
        where: {
          email: updateUserDto.email,
          id: Not(id),
        },
      });

      if (userExist) {
        throw new NotFoundException(`Usuario con este correo ${updateUserDto.email} ya existe`);
      }
    }

    if (updateUserDto.identification) {
      const userExist = await this.userRepository.findOne({
        where: {
          identification: updateUserDto.identification,
          id: Not(id),
        },
      });

      if (userExist) {
        throw new NotFoundException(`Usuario con esta identificacion ${updateUserDto.identification} ya existe`);
      }
    }

    return await this.userRepository.update(id, updateUserDto);
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con este id ${id} no fue encontrado`);
    }

    return await this.userRepository.delete(id);
  }

  async getByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async getByIdentification(identification: string) {
    return await this.userRepository.findOne({
      where: { identification },
    });
  }
}

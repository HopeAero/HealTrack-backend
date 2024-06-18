import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
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
    const userExist = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });

    if (userExist) {
      throw new HttpException(`Usuario con este correo ${createUserDto.email} ya existe`, HttpStatus.CONFLICT);
    }

    const userExistIdentification = await this.userRepository.findOne({
      where: {
        identification: createUserDto.identification,
      },
    });

    if (userExistIdentification) {
      throw new HttpException(
        `Usuario con esta identificacion ${createUserDto.identification} ya existe`,
        HttpStatus.CONFLICT,
      );
    }

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
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new HttpException(`Usuario con este id ${id} no fue encontrado`, HttpStatus.NOT_FOUND);
      }

      if (updateUserDto.email) {
        const userExist = await this.userRepository.findOne({
          where: {
            email: updateUserDto.email,
            id: Not(id),
          },
        });

        if (userExist) {
          throw new HttpException(`Usuario con este correo ${updateUserDto.email} ya existe`, HttpStatus.CONFLICT);
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
          throw new HttpException(
            `Usuario con esta identificacion ${updateUserDto.identification} ya existe`,
            HttpStatus.CONFLICT,
          );
        }
      }

      await this.userRepository.update(id, updateUserDto);

      return await this.userRepository.findOne({
        where: { id },
      });
    } catch (error) {
      console.log(error);
      throw new HttpException("Error interno", HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
      select: ["id", "email", "password", "role"],
      relations: ["patient"],
    });
  }

  async getByIdentification(identification: string) {
    return await this.userRepository.findOne({
      where: { identification },
    });
  }
}

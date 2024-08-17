import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Surgery } from "../entities/surgery.entity";
import { CreateSurgeryDto } from "../dto/create-surgery.dto";
import { UpdateSurgeryDto } from "../dto/update-surgery.dto";

@Injectable()
export class SurgeriesService {
  constructor(
    @InjectRepository(Surgery)
    private surgeriesRepository: Repository<Surgery>,
  ) {}

  async create(createSurgeryDto: CreateSurgeryDto): Promise<Surgery> {
    const existingSurgery = await this.surgeriesRepository.findOne({ where: { name: createSurgeryDto.name } });
    if (existingSurgery) {
      throw new ConflictException("Surgery already exists");
    }
    const surgery = this.surgeriesRepository.create(createSurgeryDto);
    return this.surgeriesRepository.save(surgery);
  }

  async findAll(): Promise<Surgery[]> {
    return this.surgeriesRepository.find();
  }

  async findOne(id: string): Promise<Surgery> {
    const surgery = await this.surgeriesRepository.findOne({ where: { id } });
    if (!surgery) {
      throw new NotFoundException(`Surgery with ID ${id} not found`);
    }
    return surgery;
  }

  async update(id: string, updateSurgeryDto: UpdateSurgeryDto): Promise<Surgery> {
    const updatedSurgery = await this.surgeriesRepository.findOne({ where: { id } });
    if (!updatedSurgery) {
      throw new NotFoundException(`Surgery with ID ${id} not found`);
    }

    const existingSurgery = await this.surgeriesRepository.findOne({ where: { name: updateSurgeryDto.name } });
    if (existingSurgery && existingSurgery.id !== id) {
      throw new ConflictException("Surgery already exists");
    }

    await this.surgeriesRepository.update(id, updateSurgeryDto);

    return updatedSurgery;
  }

  async remove(id: string): Promise<void> {
    const result = await this.surgeriesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Surgery with ID ${id} not found`);
    }
  }

  // Obtener todos los nombres de las cirugías
  async findAllNames(): Promise<{ name: string }[]> {
    return this.surgeriesRepository.find({ select: ["name"] });
  }
}

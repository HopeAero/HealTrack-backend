import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateHospitalDto } from "../dto/hospital.dto";
import { UpdateHospitalDto } from "../dto/hospital.dto";
import { Hospital } from "../entities/hospital.entity";

@Injectable()
export class HospitalsService {
  constructor(
    @InjectRepository(Hospital)
    private hospitalsRepository: Repository<Hospital>,
  ) {}

  async create(createHospitalDto: CreateHospitalDto): Promise<Hospital> {
    const existingHospital = await this.hospitalsRepository.findOne({ where: { name: createHospitalDto.name } });
    if (existingHospital) {
      throw new ConflictException("Hospital ya existente");
    }
    const hospital = this.hospitalsRepository.create(createHospitalDto);
    return this.hospitalsRepository.save(hospital);
  }

  async findAll(): Promise<Hospital[]> {
    return this.hospitalsRepository.find();
  }

  async findOne(id: string): Promise<Hospital> {
    const hospital = await this.hospitalsRepository.findOne({ where: { id } });
    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }
    return hospital;
  }

  async update(id: string, updateHospitalDto: UpdateHospitalDto): Promise<Hospital> {
    const updatedHospital = await this.hospitalsRepository.findOne({ where: { id } });
    if (!updatedHospital) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }

    const existingHospital = await this.hospitalsRepository.findOne({ where: { name: updateHospitalDto.name } });
    if (existingHospital && existingHospital.id !== id) {
      throw new ConflictException("Hospital ya existente");
    }

    await this.hospitalsRepository.update(id, updateHospitalDto);

    return updatedHospital;
  }

  async remove(id: string): Promise<void> {
    const result = await this.hospitalsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }
  }

  //Haya todos los nombres de los hospitales
  async findAllNames(): Promise<{ name: string }[]> {
    return this.hospitalsRepository.find({ select: ["name"] });
  }
}

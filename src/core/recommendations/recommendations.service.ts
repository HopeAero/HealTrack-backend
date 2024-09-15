// recommendations.service.ts
import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { CreateRecommendationDto } from "./dto/create-recommendation.dto";
import { UpdateRecommendationDto } from "./dto/update-recommendation.dto";
import { Recommendation } from "./entities/recommendation.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(Recommendation)
    private readonly recommendationsRepository: Repository<Recommendation>,
  ) {}

  async create(createRecommendationDto: CreateRecommendationDto) {
    try {
      const recommendation = this.recommendationsRepository.create(createRecommendationDto);
      return await this.recommendationsRepository.save(recommendation);
    } catch (error) {
      throw new HttpException(`Error interno ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll() {
    return await this.recommendationsRepository.find({
      order: {
        id: "ASC",
      },
    });
  }

  async findOne(id: number) {
    const found = await this.recommendationsRepository.findOne({ where: { id } });

    if (!found) {
      throw new NotFoundException(`Recommendation with ID ${id} not found`);
    }

    return found;
  }

  async update(id: number, updateRecommendationDto: UpdateRecommendationDto) {
    try {
      const recommendation = await this.findOne(id);

      if (!recommendation) {
        throw new NotFoundException(`Recommendation with ID ${id} not found`);
      }

      await this.recommendationsRepository.update(id, updateRecommendationDto);
      return await this.findOne(id);
    } catch (error) {
      throw new HttpException(`Error interno ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number) {
    const recommendation = await this.findOne(id);

    if (!recommendation) {
      throw new NotFoundException(`Recommendation with ID ${id} not found`);
    }

    await this.recommendationsRepository.delete(id);
    return true;
  }
}

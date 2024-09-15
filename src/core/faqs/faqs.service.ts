// faqs.service.ts
import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { CreateFAQDto } from "./dto/create-faq.dto";
import { UpdateFAQDto } from "./dto/update-faq.dto";
import { FAQ } from "./entities/faq.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class FAQsService {
  constructor(
    @InjectRepository(FAQ)
    private readonly faqsRepository: Repository<FAQ>,
  ) {}

  async create(createFAQDto: CreateFAQDto) {
    try {
      const faq = this.faqsRepository.create(createFAQDto);
      return await this.faqsRepository.save(faq);
    } catch (error) {
      throw new HttpException(`Error interno ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll() {
    return await this.faqsRepository.find({
      order: {
        id: "ASC",
      },
    });
  }

  async findOne(id: number) {
    const found = await this.faqsRepository.findOne({ where: { id } });

    if (!found) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }

    return found;
  }

  async update(id: number, updateFAQDto: UpdateFAQDto) {
    try {
      const faq = await this.findOne(id);

      if (!faq) {
        throw new NotFoundException(`FAQ with ID ${id} not found`);
      }

      await this.faqsRepository.update(id, updateFAQDto);
      return await this.findOne(id);
    } catch (error) {
      throw new HttpException(`Error interno ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number) {
    const faq = await this.findOne(id);

    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }

    await this.faqsRepository.delete(id);
    return true;
  }
}

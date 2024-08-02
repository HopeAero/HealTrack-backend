import { Injectable } from '@nestjs/common';
import { CreateRecommendDto } from './dto/create-recommend.dto';
import { UpdateRecommendDto } from './dto/update-recommend.dto';

@Injectable()
export class RecommendsService {
  create(createRecommendDto: CreateRecommendDto) {
    return 'This action adds a new recommend';
  }

  findAll() {
    return `This action returns all recommends`;
  }

  findOne(id: number) {
    return `This action returns a #${id} recommend`;
  }

  update(id: number, updateRecommendDto: UpdateRecommendDto) {
    return `This action updates a #${id} recommend`;
  }

  remove(id: number) {
    return `This action removes a #${id} recommend`;
  }
}

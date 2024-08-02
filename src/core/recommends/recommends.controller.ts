import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RecommendsService } from './recommends.service';
import { CreateRecommendDto } from './dto/create-recommend.dto';
import { UpdateRecommendDto } from './dto/update-recommend.dto';

@Controller('recommends')
export class RecommendsController {
  constructor(private readonly recommendsService: RecommendsService) {}

  @Post()
  create(@Body() createRecommendDto: CreateRecommendDto) {
    return this.recommendsService.create(createRecommendDto);
  }

  @Get()
  findAll() {
    return this.recommendsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recommendsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecommendDto: UpdateRecommendDto) {
    return this.recommendsService.update(+id, updateRecommendDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recommendsService.remove(+id);
  }
}

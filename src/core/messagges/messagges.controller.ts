import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MessaggesService } from './messagges.service';
import { CreateMessaggeDto } from './dto/create-messagge.dto';
import { UpdateMessaggeDto } from './dto/update-messagge.dto';

@Controller('messagges')
export class MessaggesController {
  constructor(private readonly messaggesService: MessaggesService) {}

  @Post()
  create(@Body() createMessaggeDto: CreateMessaggeDto) {
    return this.messaggesService.create(createMessaggeDto);
  }

  @Get()
  findAll() {
    return this.messaggesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messaggesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessaggeDto: UpdateMessaggeDto) {
    return this.messaggesService.update(+id, updateMessaggeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messaggesService.remove(+id);
  }
}

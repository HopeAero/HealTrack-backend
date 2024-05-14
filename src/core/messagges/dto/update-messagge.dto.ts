import { PartialType } from '@nestjs/mapped-types';
import { CreateMessaggeDto } from './create-messagge.dto';

export class UpdateMessaggeDto extends PartialType(CreateMessaggeDto) {}

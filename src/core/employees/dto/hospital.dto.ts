import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateHospitalDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;
}

export class UpdateHospitalDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    name?: string;

}
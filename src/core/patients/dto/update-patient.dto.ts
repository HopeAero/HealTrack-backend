import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, MinLength, MaxLength, Matches, IsNumberString, IsEmail, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Hospital } from '@src/core/employees/entities/hospital.entity';
import { SurgeryType } from '@src/constants/surgery/type';
import { isUniqueDb } from '@youba/nestjs-dbvalidator';

export class UpdatePatientDto {
    
    @ApiProperty({ example: "Emmanuel", required: false })
    @IsOptional()
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    name: string;

    @ApiProperty({ example: "Salcedinho", required: false })
    @IsOptional()
    @IsString()
    lastname: string;

    @ApiProperty({ example: 30, required: false })
    @IsOptional()
    @IsNumber()
    age: number;

    @ApiProperty({ example: "123 Main St", required: false })
    @IsOptional()
    @IsString()
    address: string;

    @ApiProperty({ example: "1234567890", required: false })
    @IsOptional()
    @IsNumberString()
    personalPhone: string;

    @ApiProperty({ example: "0987654321", required: false })
    @IsOptional()
    @IsNumberString()
    homePhone: string;

    @ApiProperty({ example: "admin@gmail.com", required: false })
    @IsEmail()
    email: string;

    @ApiProperty({ example: "V123456789", required: false })
    @IsOptional()
    @IsString()
    @MinLength(8)
    @MaxLength(20)
    identification: string;

    @ApiProperty({ type: () => Hospital, required: false })
    @IsOptional()
    @Type(() => Hospital)
    @ValidateNested()
    hospital: Hospital;

    @ApiProperty({ example: "S@lcedo2001", required: false  })
    @IsOptional()
    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'contraseña muy débil',
    })
    password: string;

    @ApiProperty({ example: "2022-12-31", required: false })
    @IsOptional()
    @IsString()
    surgeryDate: string;

    @ApiProperty({ example: "Appendectomy", required: false })
    @IsOptional()
    @IsString()
    surgeryProcedure: string;

    @ApiProperty({ enum: SurgeryType, example: SurgeryType.SURGERYTYPE1, required: false })
    @IsOptional()
    @IsEnum(SurgeryType)
    surgeryType: SurgeryType;
}
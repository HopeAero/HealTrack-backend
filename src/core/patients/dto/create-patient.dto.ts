import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsDate, IsEnum, IsDateString, IsNotEmpty, IsDefined, MinLength, MaxLength, IsEmail, IsOptional, IsPhoneNumber, Matches, ValidateNested, IsNumberString } from 'class-validator';
import { Type } from 'class-transformer';
import { Hospital } from '@src/core/employees/entities/hospital.entity';
import { SurgeryType } from '@src/constants/surgery/type';
import { isUniqueDb } from '@youba/nestjs-dbvalidator';
import { CreateHospitalDto } from '@src/core/employees/dto/hospital.dto';

export class CreatePatientDto {
    
    @ApiProperty({ example: "Emmanuel", required: true })
    @IsNotEmpty()
    @IsDefined()  
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    name: string;

    @ApiProperty({ example: "Salcedo", required: true })
    @IsNotEmpty()
    @IsString()
    lastname: string;

    @ApiProperty({example: 22, required: true})
    @IsNotEmpty()
    @IsNumber()
    age: number;

    @ApiProperty({example: "El culo de pzo", required: false })
    @IsOptional()
    @IsString()
    address: string;

    @ApiProperty({ example: "1234567890", required: true})
    @IsNotEmpty()
    @IsNumberString()
    personalPhone: string;

    @ApiProperty({ example: "0987654321", required: true})
    @IsNotEmpty()
    @IsNumberString()
    homePhone: string;

    @ApiProperty({ example: "admin@gmail.com", required: true })
    @IsNotEmpty()
    @isUniqueDb({
    table: 'patient',
    column: 'email',
    message: 'El correo ya existe',
    })
    @IsEmail()
    email: string;


    @ApiProperty({ example: "V123456789", required: true})
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(20)
    identification: string;

    @ApiProperty({ type: CreateHospitalDto, required: true })
    @IsNotEmpty()
    @Type(() => Hospital)
    @ValidateNested()
    hospital: Hospital;

    @ApiProperty({ example: "S@lcedo2001", required: true  })
    @IsNotEmpty()
    @IsDefined()
    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'contraseña muy débil',
    })
    password: string;

    @ApiProperty({ example: "2021-09-01", required: true})
    @IsNotEmpty()
    @IsDateString()
    surgeryDate: string;

    @ApiProperty({ example: "Cirugía de corazón", required: true})
    @IsNotEmpty()
    @IsString()
    surgeryProcedure: string;

    @ApiProperty({ enum: SurgeryType })
    @IsNotEmpty()
    @IsEnum(SurgeryType)
    surgeryType: SurgeryType;

    @ApiProperty({ example: 1, required: true})
    @IsNotEmpty()
    @IsNumber()
    medicId: number;
}
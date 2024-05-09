import {
    IsString,
    MinLength,
    MaxLength,
    Matches,
    IsOptional,
    IsDefined,
    IsIn,
    IsNotEmpty,
    IsEmail,
    IsEnum,
    IsJSON,
    ValidateNested,
  } from 'class-validator';
import { Type } from 'class-transformer';
import { EmployeeRole } from 'src/constants';
import { isUniqueDb } from '@youba/nestjs-dbvalidator';
import { ApiProperty } from '@nestjs/swagger';
import { Hospital } from '../entities/hospital.entity';
import { CreateHospitalDto } from './hospital.dto';

export class CreateEmployeeDto {

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

    @ApiProperty({ example: "admin@gmail.com", required: true })
    @IsNotEmpty()
    @isUniqueDb({
    table: 'employee',
    column: 'email',
    message: 'El correo ya existe',
    })
    @IsEmail()
    email: string;

    @ApiProperty({ example: "V30109748", required: true })
    @IsNotEmpty()
    @isUniqueDb({
    table: 'employee',
    column: 'identification',
    message: 'La identificación ya existe',
    })
    @IsString()
    @MinLength(8)
    @MaxLength(20)
    identification: string;
    
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

    @ApiProperty({ type: CreateHospitalDto, required: true })
    @IsNotEmpty()
    @Type(() => Hospital)
    @ValidateNested()
    hospital: Hospital;


    @ApiProperty({ enum: EmployeeRole, example: EmployeeRole.ADMIN})
    @IsOptional()
    @IsEnum(EmployeeRole, { message: 'Rol invalido' })
    role: EmployeeRole;
}

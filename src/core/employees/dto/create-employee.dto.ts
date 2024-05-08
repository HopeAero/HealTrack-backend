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
  } from 'class-validator';
import { EmployeeRole } from 'src/constants';
import { isUniqueDb } from '@youba/nestjs-dbvalidator';

export class CreateEmployeeDto {
    @IsDefined()  
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    name: string;

    @IsString()
    @IsOptional()
    lastname: string;

    @IsNotEmpty()
    @isUniqueDb({
    table: 'employee',
    column: 'email',
    message: 'El correo ya existe',
    })
    @IsEmail()
    email: string;

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
    
    @IsDefined()
    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'contraseña muy débil',
    })
    password: string;
    
    @IsOptional()
    @IsIn([EmployeeRole.ADMIN, EmployeeRole.SPECIALIST, EmployeeRole.ASSISTANT])
    role: EmployeeRole;
}

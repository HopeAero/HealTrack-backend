import { isUniqueDb } from "@youba/nestjs-dbvalidator";
import { IsEmail, IsIn, IsOptional, IsString } from "class-validator";
import { EmployeeRole } from "src/constants";

export class UpdateEmployeeDto {
    
    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    lastname: string;

    @isUniqueDb({
        table: 'employee',
        column: 'email',
        message: 'Correo ya existe',
      })
    @IsEmail()
    @IsOptional()
    email: string;

    @IsString()
    @IsOptional()
    identification: string;

    @IsOptional()
    isVerify: boolean;

    @IsIn([EmployeeRole.ADMIN, EmployeeRole.SPECIALIST, EmployeeRole.ASSISTANT])
    @IsOptional()
    role: EmployeeRole;
}

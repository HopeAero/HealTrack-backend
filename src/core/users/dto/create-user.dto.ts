import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsDefined,
  IsNotEmpty,
  IsEmail,
  IsEnum,
} from "class-validator";
import { AllRole } from "src/constants";
import { isUniqueDb } from "@youba/nestjs-dbvalidator";
import { ApiProperty } from "@nestjs/swagger";
import { Employee } from "@src/core/employees/entities/employee.entity";
import { Patient } from "@src/core/patients/entities/patient.entity";

export class CreateUserDto {
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
    table: "user",
    column: "email",
    message: "El correo ya existe",
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "V30109748", required: true })
  @IsNotEmpty()
  @isUniqueDb({
    table: "user",
    column: "identification",
    message: "La identificación ya existe",
  })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  identification: string;

  @ApiProperty({ example: "S@lcedo2001", required: true })
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: "contraseña muy débil",
  })
  password: string;

  @ApiProperty({ enum: AllRole, example: AllRole.PATIENT })
  @IsOptional()
  @IsEnum(AllRole, { message: "Rol invalido" })
  role: AllRole;

  @ApiProperty({ type: () => Employee })
  @IsOptional()
  employee: Employee;

  @ApiProperty({ type: () => Patient })
  @IsOptional()
  patient: Patient;
}

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
  Validate,
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
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: "Salcedo", required: true })
  @IsNotEmpty()
  @IsString()
  lastname: string;

  @ApiProperty({ example: "admin@gmail.com", required: true })
  @IsNotEmpty()
  @Validate(isUniqueDb, ["user", "email", "El correo ya existe"])
  @IsEmail()
  email: string;

  @ApiProperty({ example: "V30109748", required: true })
  @IsNotEmpty()
  @Validate(isUniqueDb, ["user", "identification", "La cédula ya existe"])
  @IsString()
  @MinLength(1)
  identification: string;

  @ApiProperty({ example: "S@lcedo2001", required: true })
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  @MinLength(1)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: "contraseña muy débil",
  })
  password: string;

  @ApiProperty({ example: AllRole.PATIENT, required: true })
  @IsOptional()
  @IsEnum(AllRole, { message: "Rol invalido" })
  role: AllRole;

  @IsOptional()
  employee: Employee;

  @IsOptional()
  patient: Patient;
}

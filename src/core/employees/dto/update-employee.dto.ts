import { ApiProperty } from "@nestjs/swagger";
import { isUniqueDb } from "@youba/nestjs-dbvalidator";
import { IsEmail, IsEnum, IsIn, IsJSON, IsOptional, IsString, ValidateNested } from "class-validator";
import { EmployeeRole } from "src/constants";
import { Hospital } from "../entities/hospital.entity";
import { Type } from "@nestjs/common";

export class UpdateEmployeeDto {
    
    @ApiProperty({ example: "Emmanuel"})
    @IsString()
    @IsOptional()
    name: string;

    @ApiProperty({ example: "Salcedo"})
    @IsString()
    @IsOptional()
    lastname: string;

    @ApiProperty({ example: "admin@gmail.com"})
    @IsEmail()
    @IsOptional()
    email: string;

    @ApiProperty({ example: "V30109748"})
    @IsString()
    @IsOptional()
    identification: string;

    @IsOptional()
    isVerify: boolean;

    @ApiProperty({ example: { id: 'ac3d858c-dc04-4d18-9cf6-23cf06db922f' , name: "Hospital"}, required: true })
    @IsOptional()
    @Type(() => Hospital)
    @ValidateNested()
    hospital: Hospital;
    
    @ApiProperty({ enum: EmployeeRole, example: EmployeeRole.ADMIN})
    @IsEnum(EmployeeRole, { message: 'Rol invalido' })
    @IsOptional()
    role: EmployeeRole;
}

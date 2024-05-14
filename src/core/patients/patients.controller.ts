import { Controller, Get, Post, Body, Patch, Param, Delete, Response } from "@nestjs/common";
import { PatientsService } from "./service/patients.service";
import { CreatePatientDto } from "./dto/create-patient.dto";
import { UpdatePatientDto } from "./dto/update-patient.dto";
import { ApiTags } from "@nestjs/swagger";
import * as express from "express";

@ApiTags("patients")
@Controller("patients")
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  async create(@Body() createPatientDto: CreatePatientDto) {
    return await this.patientsService.create(createPatientDto);
  }

  @Get()
  async findAll() {
    return await this.patientsService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return await this.patientsService.findOne(+id);
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @Response() response: express.Response,
  ) {
    try {
      const result = await this.patientsService.update(+id, updatePatientDto);

      if (result) {
        return response.status(200).json({
          message: "Se ha actualizado correctamente el paciente",
        });
      }

      return response.status(400).json({
        message: "No se ha podido actualizar el paciente",
      });
    } catch (error) {
      return response.status(error.status).json({
        message: error.message,
      });
    }
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @Response() response: express.Response) {
    try {
      await this.patientsService.remove(+id);

      return response.status(200).json({
        message: "Se ha eliminado correctamente el paciente",
      });
    } catch (error) {
      return response.status(error.status).json({
        message: error.message,
      });
    }
  }
}

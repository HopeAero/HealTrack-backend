import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Response,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { StatusPatient } from "@src/constants/status/statusPatient";
import { UpdatePatientStateDto } from "./dto/update-patient-state.dto";
import { PatientsService } from "./service/patients.service";
import { UpdatePatientDto } from "./dto/update-patient.dto";
import { ApiTags } from "@nestjs/swagger";
import * as express from "express";

@ApiTags("patients")
@Controller("patients")
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  async findAll(@Query("status") status: StatusPatient) {
    return await this.patientsService.findAll(status);
  }

  @Get("todos")
  async findAll_No_Status() {
    return await this.patientsService.findAll();
  }

  @Get("ten-newest-patients")
  async find_10_newest() {
    return await this.patientsService.find_10_newest();
  }

  // Obtener porcentajes de estado de pacientes
  @Get("status-percentages")
  async getPatientStatusPercentages() {
    const percentages = await this.patientsService.getPatientStatusPercentages();
    return { percentages };
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return await this.patientsService.findOne(+id);
  }

  @Get("user/:id")
  async findOneByUserId(@Param("id") id: string) {
    return await this.patientsService.findOneByUserId(+id);
  }

  @Get("employee/:id")
  async findByEmployee(@Param("id") id: string, @Query("status") status: StatusPatient) {
    return await this.patientsService.findByEmployee(+id, status);
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

  @Patch(":id/state")
  async updateState(
    @Param("id") id: string,
    @Body() updatePatientStateDto: UpdatePatientStateDto,
    @Response() response: express.Response,
  ) {
    try {
      const result = await this.patientsService.updateState(+id, updatePatientStateDto);

      if (result) {
        return response.status(200).json({
          message: "Se ha actualizado correctamente el estado del paciente",
        });
      }

      return response.status(400).json({
        message: "No se ha podido actualizar el estado del paciente",
      });
    } catch (error) {
      console.log(error);
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

  @Get(":id/medic-name")
  async getMedicName(@Param("id") id: number) {
    const medicName = await this.patientsService.getMedicNameByPatient(id);
    return { medicName };
  }

  @Post(":id/panic-button")
  @HttpCode(HttpStatus.NO_CONTENT)
  async handlePanicButton(@Param("id") id: number) {
    await this.patientsService.handlePanicButton(id);
  }
}

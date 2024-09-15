import { Controller, Get, Post, Body, Patch, Param, Delete, Response } from "@nestjs/common";
import { HospitalsService } from "./service/hospital.service";
import { CreateHospitalDto } from "./dto/hospital.dto";
import { UpdateHospitalDto } from "./dto/hospital.dto";
import { ApiTags } from "@nestjs/swagger";
import * as express from "express";

@ApiTags("hospitals")
@Controller("hospitals")
export class HospitalsController {
  constructor(private readonly hospitalsService: HospitalsService) {}

  @Post()
  async create(@Body() createHospitalDto: CreateHospitalDto, @Response() response: express.Response) {
    try {
      const hospital = await this.hospitalsService.create(createHospitalDto);
      return response.status(201).json(hospital);
    } catch (error) {
      return response.status(error.status).json({
        message: error.message,
      });
    }
  }

  @Get()
  async findAll(@Response() response: express.Response) {
    try {
      const hospitals = await this.hospitalsService.findAll();
      return response.status(200).json(hospitals);
    } catch (error) {
      return response.status(error.status).json({
        message: error.message,
      });
    }
  }

  @Get("names")
  async findAllNames(@Response() response: express.Response) {
    try {
      const hospitalNames = await this.hospitalsService.findAllNames();
      return response.status(200).json(hospitalNames);
    } catch (error) {
      return response.status(error.status).json({
        message: error.message,
      });
    }
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Response() response: express.Response) {
    try {
      const hospital = await this.hospitalsService.findOne(id);
      return response.status(200).json(hospital);
    } catch (error) {
      return response.status(error.status).json({
        message: error.message,
      });
    }
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateHospitalDto: UpdateHospitalDto,
    @Response() response: express.Response,
  ) {
    try {
      const hospital = await this.hospitalsService.update(id, updateHospitalDto);
      return response.status(200).json(hospital);
    } catch (error) {
      return response.status(error.status).json({
        message: error.message,
      });
    }
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @Response() response: express.Response) {
    try {
      await this.hospitalsService.remove(id);
      return response.status(200).json({
        message: "Se ha eliminado correctamente el hospital",
      });
    } catch (error) {
      return response.status(error.status).json({
        message: error.message,
      });
    }
  }
}

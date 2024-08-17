import { Controller, Get, Post, Body, Patch, Param, Delete, Response } from "@nestjs/common";
import { SurgeriesService } from "./service/surgeries.service";
import { CreateSurgeryDto } from "./dto/create-surgery.dto";
import { UpdateSurgeryDto } from "./dto/update-surgery.dto";
import { ApiTags } from "@nestjs/swagger";
import * as express from "express";

@ApiTags("surgeries")
@Controller("surgeries")
export class SurgeriesController {
  constructor(private readonly surgeriesService: SurgeriesService) {}

  @Post()
  async create(@Body() createSurgeryDto: CreateSurgeryDto, @Response() response: express.Response) {
    try {
      const surgery = await this.surgeriesService.create(createSurgeryDto);
      return response.status(201).json(surgery);
    } catch (error) {
      return response.status(error.status).json({
        message: error.message,
      });
    }
  }

  @Get()
  async findAll(@Response() response: express.Response) {
    try {
      const surgeries = await this.surgeriesService.findAll();
      return response.status(200).json(surgeries);
    } catch (error) {
      return response.status(error.status).json({
        message: error.message,
      });
    }
  }

  @Get("names")
  async findAllNames(@Response() response: express.Response) {
    try {
      const surgeryNames = await this.surgeriesService.findAllNames();
      return response.status(200).json(surgeryNames);
    } catch (error) {
      return response.status(error.status).json({
        message: error.message,
      });
    }
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Response() response: express.Response) {
    try {
      const surgery = await this.surgeriesService.findOne(id);
      return response.status(200).json(surgery);
    } catch (error) {
      return response.status(error.status).json({
        message: error.message,
      });
    }
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateSurgeryDto: UpdateSurgeryDto,
    @Response() response: express.Response,
  ) {
    try {
      const surgery = await this.surgeriesService.update(id, updateSurgeryDto);
      return response.status(200).json(surgery);
    } catch (error) {
      return response.status(error.status).json({
        message: error.message,
      });
    }
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @Response() response: express.Response) {
    try {
      await this.surgeriesService.remove(id);
      return response.status(200).json({
        message: "Surgery has been successfully deleted",
      });
    } catch (error) {
      return response.status(error.status).json({
        message: error.message,
      });
    }
  }
}

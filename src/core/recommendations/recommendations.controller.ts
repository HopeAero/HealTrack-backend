// recommendations.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Response } from "@nestjs/common";
import { RecommendationsService } from "./recommendations.service";
import { CreateRecommendationDto } from "./dto/create-recommendation.dto";
import { UpdateRecommendationDto } from "./dto/update-recommendation.dto";
import { ApiTags } from "@nestjs/swagger";
import * as express from "express";

@ApiTags("recommendations")
@Controller("recommendations")
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get()
  async findAll() {
    return this.recommendationsService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    try {
      return this.recommendationsService.findOne(+id);
    } catch (error) {
      return {
        status: error.status,
        message: error.message,
      };
    }
  }

  @Post()
  async create(@Body() createRecommendationDto: CreateRecommendationDto, @Response() response: express.Response) {
    try {
      const recommendation = await this.recommendationsService.create(createRecommendationDto);
      return response.status(201).json({
        message: "Recommendation created successfully",
        data: recommendation,
      });
    } catch (error) {
      return response.status(error.status).json({
        message: error.message,
      });
    }
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateRecommendationDto: UpdateRecommendationDto,
    @Response() response: express.Response,
  ) {
    try {
      const recommendation = await this.recommendationsService.update(+id, updateRecommendationDto);
      return response.status(200).json({
        message: "Recommendation updated successfully",
        data: recommendation,
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
      await this.recommendationsService.remove(+id);
      return response.status(200).json({
        message: "Recommendation deleted successfully",
      });
    } catch (error) {
      return response.status(error.status).json({
        message: error.message,
      });
    }
  }
}

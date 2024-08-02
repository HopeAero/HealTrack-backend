// faqs.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Response } from "@nestjs/common";
import { FAQsService } from "./faqs.service";
import { CreateFAQDto } from "./dto/create-faq.dto";
import { UpdateFAQDto } from "./dto/update-faq.dto";
import { ApiTags } from "@nestjs/swagger";
import * as express from "express";

@ApiTags("faqs")
@Controller("faqs")
export class FAQsController {
  constructor(private readonly faqsService: FAQsService) {}

  @Get()
  async findAll() {
    return this.faqsService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    try {
      return this.faqsService.findOne(+id);
    } catch (error) {
      return {
        status: error.status,
        message: error.message,
      };
    }
  }

  @Post()
  async create(@Body() createFAQDto: CreateFAQDto, @Response() response: express.Response) {
    try {
      const faq = await this.faqsService.create(createFAQDto);
      return response.status(201).json({
        message: "FAQ created successfully",
        data: faq,
      });
    } catch (error) {
      return response.status(error.status).json({
        message: error.message,
      });
    }
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateFAQDto: UpdateFAQDto, @Response() response: express.Response) {
    try {
      const faq = await this.faqsService.update(+id, updateFAQDto);
      return response.status(200).json({
        message: "FAQ updated successfully",
        data: faq,
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
      await this.faqsService.remove(+id);
      return response.status(200).json({
        message: "FAQ deleted successfully",
      });
    } catch (error) {
      return response.status(error.status).json({
        message: error.message,
      });
    }
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res } from "@nestjs/common";
import { CreateReportDto } from "./dto/create-report.dto";
import { ReportsService } from "./service/reports.service";
import { AuthGuard } from "../auth/guard/auth.guard";
import { ActiveUser } from "@src/common/decorator/active-user-decorator";
import { UserActiveInterface } from "@src/common/interface/user-active-interface";
import { Response } from "express";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() createReportDto: CreateReportDto,
    @ActiveUser() user: UserActiveInterface,
    @Res() res: Response,
  ) {
    try {
      return this.reportsService.create(createReportDto, user);
    } catch (error) {
      return res.status(error.status).json({ message: error.message });
    }
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll() {
    return this.reportsService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.reportsService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.reportsService.remove(+id);
  }
}

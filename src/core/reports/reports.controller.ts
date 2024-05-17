import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res } from "@nestjs/common";
import { CreateReportDto } from "./dto/create-report.dto";
import { ReportsService } from "./service/reports.service";
import { AuthGuard } from "../auth/guard/auth.guard";
import { ActiveUser } from "@src/common/decorator/active-user-decorator";
import { UserActiveInterface } from "@src/common/interface/user-active-interface";
import { Response } from "express";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Auth } from "../auth/decorator/auth.decorator";
import { AllRole } from "@src/constants";

@ApiTags("reports")
@Controller("reports")
@ApiBearerAuth()
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
      const report = await this.reportsService.create(createReportDto, user);

      return res.status(200).json({
        report,
      });
    } catch (error) {
      return res.status(error.status).json({ message: error.message, error: error });
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

  @Auth(AllRole.ADMIN)
  @Delete(":id")
  async remove(@Param("id") id: string, @Res() res: Response) {
    try {
      await this.reportsService.remove(+id);

      return res.status(200).json({
        message: "Se ha eliminado correctamente el reporte",
      });
    } catch (error) {
      return res.status(error.status).json({ message: error.message, error: error });
    }
  }
}

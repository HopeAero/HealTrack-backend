import { Controller, Get, Post, Body, Param, UseGuards, Res, Query } from "@nestjs/common";
import { AppFormularyService } from "./services/appForms.service";
import { CreateAppFormularyDto } from "./dto/create-appForm.dto";
import { AuthGuard } from "../auth/guard/auth.guard";
import { ActiveUser } from "@src/common/decorator/active-user-decorator";
import { UserActiveInterface } from "@src/common/interface/user-active-interface";
import { Response } from "express";
import { ApiTags } from "@nestjs/swagger";
import { Auth } from "../auth/decorator/auth.decorator";
import { AllRole } from "@src/constants";

@ApiTags("app-formulary")
@Controller("app-formulary")
export class AppFormularyController {
  constructor(private readonly appFormularyService: AppFormularyService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() createAppFormularyDto: CreateAppFormularyDto,
    @ActiveUser() user: UserActiveInterface,
    @Res() res: Response,
  ) {
    try {
      const appFormulary = await this.appFormularyService.create(createAppFormularyDto, user);

      return res.status(200).json({
        appFormulary,
      });
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message });
    }
  }

  @Get()
  async findAll(@Query("page") page: number, @Query("limit") limit: number, @Res() res: Response) {
    try {
      const appFormularies = await this.appFormularyService.findAll(page, limit);
      return res.status(200).json(appFormularies);
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message });
    }
  }

  @Get("satisfaction/total")
  async calculateTotalSatisfaction(@Res() res: Response) {
    try {
      const totalSatisfaction = await this.appFormularyService.calculateTotalSatisfaction();
      return res.status(200).json({ totalSatisfaction });
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message });
    }
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Res() res: Response) {
    try {
      const appFormulary = await this.appFormularyService.findOne(+id);
      return res.status(200).json(appFormulary);
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message });
    }
  }

  @Get("satisfaction/:id")
  async calculateSatisfaction(@Param("id") id: string, @Res() res: Response) {
    try {
      const satisfactionPercentage = await this.appFormularyService.calculateSatisfactionById(+id);
      return res.status(200).json({ satisfactionPercentage });
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message });
    }
  }

  @Get("user/submitted/:id")
  async checkUserFormSubmission(@Param("id") id: number, @Res() res: Response) {
    try {
      const hasSubmitted = await this.appFormularyService.hasUserSubmittedForm(id);
      return res.status(200).json({ hasSubmitted });
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message });
    }
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  UseInterceptors,
  Query,
} from "@nestjs/common";
import { CreateReportDto } from "./dto/create-report.dto";
import { ReportsService } from "./service/reports.service";
import { AuthGuard } from "../auth/guard/auth.guard";
import { ActiveUser } from "@src/common/decorator/active-user-decorator";
import { UserActiveInterface } from "@src/common/interface/user-active-interface";
import { Response } from "express";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { Auth } from "../auth/decorator/auth.decorator";
import { AllRole } from "@src/constants";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { ReportFilterDto } from "./dto/report-filter.dto";
import { ReportMedic } from "./entities/report.entity";
import { PaginatedResult } from "@src/constants/paginate/type";
import { UpdateReportDto } from "./dto/update-report.dto";

const storage = diskStorage({
  destination: "./upload",
  filename: (req, file, cb) => {
    const name = file.originalname.split(".")[0];
    const extension = extname(file.originalname);
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join("");
    cb(null, `${randomName}${extension}`);
  },
});

@ApiTags("reports")
@Controller("reports")
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  @Post()
  async create(
    @Body() createReportDto: CreateReportDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: ".(png|jpeg|jpg)" })],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
    @ActiveUser() user: UserActiveInterface,
    @Res() res: Response,
  ) {
    try {
      const report = await this.reportsService.create(createReportDto, file, user);

      return res.status(200).json({
        report,
      });
    } catch (error) {
      return res.status(error.status).json({ message: error.message, error: error });
    }
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Query() filterDto: ReportFilterDto): Promise<PaginatedResult<ReportMedic>> {
    return this.reportsService.findAll(filterDto);
  }

  @UseGuards(AuthGuard)
  @Get("reported")
  async hasReported(@ActiveUser() user: UserActiveInterface): Promise<Boolean> {
    console.log(user.id);
    return this.reportsService.hasReported(user.id);
  }

  @UseGuards(AuthGuard)
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.reportsService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Get("user/:id")
  async findByUser(@Param("id") id: number, @Query() filterDto: ReportFilterDto) {
    return this.reportsService.findByUser(id, filterDto);
  }

  @UseGuards(AuthGuard)
  @Get("employee/:id")
  async findByEmployee(@Param("id") id: number, @Query() filterDto: ReportFilterDto) {
    return this.reportsService.findByEmployee(id, filterDto);
  }

  @UseGuards(AuthGuard)
  @Post(":id/upload")
  @UseInterceptors(FileInterceptor("file", { storage }))
  async uploadFile(
    @Param("id") id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: ".(png|jpeg|jpg)" })],
      }),
    )
    file: Express.Multer.File,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return await this.reportsService.uploadFile(+id, file, user);
  }

  //@Auth(AllRole.ADMIN)
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

  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  @Patch(":id")
  async updateReport(
    @Param("id") id: string,
    @Body() updateReportDto: UpdateReportDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: ".(png|jpeg|jpg)" })],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
    @ActiveUser() user: UserActiveInterface,
    @Res() res: Response,
  ) {
    try {
      const report = await this.reportsService.update(+id, updateReportDto, file, user);

      return res.status(200).json({
        report,
      });
    } catch (error) {
      return res.status(error.status).json({ message: error.message, error: error });
    }
  }
}

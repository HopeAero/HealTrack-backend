import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateReportDto } from "../dto/create-report.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { ReportMedic } from "../entities/report.entity";
import { Repository } from "typeorm";
import { UsersService } from "@src/core/users/service/users.service";
import { UserActiveInterface } from "@src/common/interface/user-active-interface";
import { AllRole } from "@src/constants";
import { envData } from "@src/config/typeorm";

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportMedic)
    private readonly reportRepository: Repository<ReportMedic>,
    private readonly userService: UsersService,
  ) {}

  async create(createReportDto: CreateReportDto, user: UserActiveInterface): Promise<ReportMedic> {
    const activeUser = await this.userService.findOne(user.id);

    if (!activeUser) {
      throw new Error("User not found");
    }

    if (activeUser.role === AllRole.ASSISTANT || activeUser.role === AllRole.SPECIALIST) {
      createReportDto.isRespondingForEmployee = true;
    } else {
      createReportDto.isRespondingForEmployee = false;
    }

    const report = await this.reportRepository.save({
      ...createReportDto,
      user: activeUser,
    });

    return report;
  }

  async uploadFile(id: number, file: Express.Multer.File, user: UserActiveInterface) {
    let report = await this.reportRepository.findOne({
      where: {
        id,
        user: {
          id: user.id,
        },
      },
    });

    if (!report) {
      throw new NotFoundException("Report not found");
    }

    let count = 0;

    if (report.hasHighTemperature) {
      count++;
    }

    if (report.hasRedness) {
      count++;
    }

    if (report.hasSecretions) {
      count++;
    }

    if (report.hasSwelling) {
      count++;
    }

    if (count >= 2) {
      const newPath = envData.DATABASE_URL + "/" + file.path.replace(/\\/g, "/");

      report.fileUrl = newPath;

      await this.reportRepository.save(report);
    } else {
      throw new BadRequestException("Este reporte no necesita archivo adjunto");
    }

    return report;
  }

  async findAll(): Promise<ReportMedic[]> {
    return this.reportRepository.find();
  }

  async findOne(id: number): Promise<ReportMedic> {
    return this.reportRepository.findOne({
      where: { id },
    });
  }

  async remove(id: number): Promise<void> {
    const report = await this.reportRepository.findOne({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException("Report not found");
    }

    await this.reportRepository.softDelete(id);
  }
}

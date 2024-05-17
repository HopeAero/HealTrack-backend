import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateReportDto } from "../dto/create-report.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { ReportMedic } from "../entities/report.entity";
import { Repository } from "typeorm";
import { UsersService } from "@src/core/users/service/users.service";
import { UserActiveInterface } from "@src/common/interface/user-active-interface";
import { AllRole } from "@src/constants";

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

import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateReportDto } from "../dto/create-report.dto";
import { ReportFilterDto } from "../dto/report-filter.dto";
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

  async create(
    createReportDto: CreateReportDto,
    file: Express.Multer.File,
    user: UserActiveInterface,
  ): Promise<ReportMedic> {
    const activeUser = await this.userService.findOne(user.id);

    if (!activeUser) {
      throw new Error("User not found");
    }

    if (activeUser.role === AllRole.ASSISTANT || activeUser.role === AllRole.SPECIALIST) {
      createReportDto.isRespondingForEmployee = true;
    } else {
      createReportDto.isRespondingForEmployee = false;
    }
    if (file) {
      const newPath = envData.DATABASE_URL + "/" + file.path.replace(/\\/g, "/");
      createReportDto.fileUrl = newPath;
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

  async findAll(filterDto: ReportFilterDto): Promise<ReportMedic[]> {
    const { startDate, endDate, userId } = filterDto;

    const query = this.reportRepository
      .createQueryBuilder("report")
      .innerJoinAndSelect("report.user", "user")
      .innerJoinAndSelect("user.patient", "patient");

    if (startDate) {
      query.andWhere("report.createdAt >= :startDate", { startDate });
    }

    if (endDate) {
      query.andWhere("report.createdAt <= :endDate", { endDate });
    }

    if (userId) {
      query.andWhere("report.user.id = :userId", { userId });
    }

    query.orderBy("report.createdAt", "DESC");

    const reports = await query.getMany();
    return reports;
  }

  async findOne(id: number): Promise<ReportMedic> {
    return this.reportRepository.findOne({
      where: { id },
    });
  }

  async findByUser(userId: number, filterDto?: ReportFilterDto): Promise<ReportMedic[]> {
    const query = this.reportRepository
      .createQueryBuilder("report")
      .innerJoinAndSelect("report.user", "user")
      .innerJoinAndSelect("user.patient", "patient")
      .where("report.user.id = :userId", { userId });

    if (filterDto?.startDate) {
      query.andWhere("report.createdAt >= :startDate", { startDate: filterDto.startDate });
    }

    if (filterDto?.endDate) {
      query.andWhere("report.createdAt <= :endDate", { endDate: filterDto.endDate });
    }

    query.orderBy("report.createdAt", "DESC");

    const reports = await query.getMany();
    return reports;
  }

  async findByEmployee(employeeId: number, filterDto?: ReportFilterDto): Promise<ReportMedic[]> {
    const query = this.reportRepository
      .createQueryBuilder("report")
      .innerJoinAndSelect("report.user", "user")
      .innerJoinAndSelect("user.patient", "patient")
      .innerJoin("patient.medic", "employee")
      .where("employee.id = :employeeId", { employeeId });

    if (filterDto?.startDate) {
      query.andWhere("report.createdAt >= :startDate", { startDate: filterDto.startDate });
    }

    if (filterDto?.endDate) {
      query.andWhere("report.createdAt <= :endDate", { endDate: filterDto.endDate });
    }

    if (filterDto?.userId) {
      query.andWhere("report.user.id = :userId", { userId: filterDto.userId });
    }

    query.orderBy("report.createdAt", "DESC");

    const reports = await query.getMany();
    return reports;
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

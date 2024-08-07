import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateReportDto } from "../dto/create-report.dto";
import { ReportFilterDto } from "../dto/report-filter.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { ReportMedic } from "../entities/report.entity";
import { Between, LessThanOrEqual, Repository } from "typeorm";
import { UsersService } from "@src/core/users/service/users.service";
import { UserActiveInterface } from "@src/common/interface/user-active-interface";
import { AllRole } from "@src/constants";
import { envData } from "@src/config/typeorm";
import { PaginatedResult } from "@src/constants/paginate/type";
import { UpdateReportDto } from "../dto/update-report.dto";

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
    console.log(createReportDto);
    console.log();
    console.log();
    console.log(file);
    console.log();
    console.log();
    console.log(user);
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

  async findAll(filterDto: ReportFilterDto): Promise<PaginatedResult<ReportMedic>> {
    const { startDate, endDate, userId, page = 1, limit = 5 } = filterDto;

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

    // Obtener el total de resultados sin paginación
    const total = await query.getCount();

    // Paginación
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const reports = await query.getMany();

    // Calcular el total de páginas
    const totalPages = Math.ceil(total / limit);

    return {
      data: reports,
      paginationData: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
      },
    };
  }

  async findOne(id: number): Promise<ReportMedic> {
    return this.reportRepository.findOne({
      where: { id },
    });
  }

  async findByUser(userId: number, filterDto?: ReportFilterDto): Promise<PaginatedResult<ReportMedic>> {
    const { startDate, endDate, page = 1, limit = 5 } = filterDto || {};

    const query = this.reportRepository
      .createQueryBuilder("report")
      .innerJoinAndSelect("report.user", "user")
      .innerJoinAndSelect("user.patient", "patient")
      .where("report.user.id = :userId", { userId });

    if (startDate) {
      query.andWhere("report.createdAt >= :startDate", { startDate });
    }

    if (endDate) {
      query.andWhere("report.createdAt <= :endDate", { endDate });
    }

    query.orderBy("report.createdAt", "DESC");

    // Obtener el total de resultados sin paginación
    const total = await query.getCount();

    // Paginación
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const reports = await query.getMany();

    // Calcular el total de páginas
    const totalPages = Math.ceil(total / limit);

    return {
      data: reports,
      paginationData: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
      },
    };
  }

  async findByEmployee(employeeId: number, filterDto?: ReportFilterDto): Promise<PaginatedResult<ReportMedic>> {
    const { startDate, endDate, userId, page = 1, limit = 5 } = filterDto || {};

    const query = this.reportRepository
      .createQueryBuilder("report")
      .innerJoinAndSelect("report.user", "user")
      .innerJoinAndSelect("user.patient", "patient")
      .innerJoin("patient.medic", "employee")
      .innerJoin("patient.asistant", "asistant")
      .where("employee.id = :employeeId OR asistant.id = :employeeId", { employeeId });

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

    // Obtener el total de resultados sin paginación
    const total = await query.getCount();

    // Paginación
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const reports = await query.getMany();

    // Calcular el total de páginas
    const totalPages = Math.ceil(total / limit);

    return {
      data: reports,
      paginationData: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
      },
    };
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

  async hasReported(userId): Promise<boolean> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6);
    const sixAM = new Date(today);

    let report: ReportMedic;

    if (now >= sixAM) {
      // Si la hora actual es mayor a 6 am, busca un reporte de hoy mayor a 6 am
      report = await this.reportRepository.findOne({
        where: {
          createdAt: Between(sixAM, now),
          user: { id: userId },
        },
      });
    } else {
      // Si la hora actual es menor a 6 am, busca un reporte de ayer o de hoy antes de las 6 am
      const yesterdaySixAM = new Date(today.setDate(today.getDate() - 1));

      report = await this.reportRepository.findOne({
        where: [
          {
            createdAt: Between(yesterdaySixAM, sixAM),
            user: { id: userId },
          },
          {
            createdAt: LessThanOrEqual(sixAM),
            user: { id: userId },
          },
        ],
      });
    }

    return !!report;
  }

  async update(
    id: number,
    updateReportDto: UpdateReportDto,
    file: Express.Multer.File,
    user: UserActiveInterface,
  ): Promise<ReportMedic> {
    // Buscamos si el reporte corresponde la paciente que va a cambiar su foto
    const report = await this.reportRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!report) {
      throw new ForbiddenException("Solo el paciente puede reenviar su foto");
    }

    // Cambiamos foto
    if (file) {
      const newPath = envData.DATABASE_URL + "/" + file.path.replace(/\\/g, "/");
      updateReportDto.fileUrl = newPath;
    }

    // Actualizar el reporte con los datos del DTO
    Object.assign(report, updateReportDto);

    return this.reportRepository.save(report);
  }
}

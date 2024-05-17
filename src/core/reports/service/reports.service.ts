import { Injectable } from "@nestjs/common";
import { CreateReportDto } from "../dto/create-report.dto";
import { UpdateReportDto } from "../dto/update-report.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { ReportMedic } from "../entities/report.entity";
import { Repository } from "typeorm";

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportMedic)
    private readonly reportRepository: Repository<ReportMedic>,
  ) {}

  async create
}

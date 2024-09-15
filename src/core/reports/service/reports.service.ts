import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
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
import * as ExcelJS from "exceljs";
import * as dayjs from "dayjs";
import { User } from "@src/core/users/entities/user.entity";
import { Patient } from "@src/core/patients/entities/patient.entity";

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportMedic)
    private readonly reportRepository: Repository<ReportMedic>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
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

  // Funcion para encontrar SurgyeryProcedure
  async getSurgeryProcedureByUserId(userId: number): Promise<string> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["patient"],
    });

    if (!user || !user.patient) {
      return "No especificado";
    }

    return user.patient.surgeryProcedure || "No especificado";
  }

  async getPatientInformationById(userId: number): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["patient"],
    });
  
    if (!user || !user.patient) {
      return null; // Retorna null si no se encuentra el paciente
    }
  
    const patient = user.patient;
    return {
      email: user.email,
      identification: user.identification,
      age: patient.age,
      address: patient.address,
      personalPhone: patient.personalPhone,
      homePhone: patient.homePhone,
      hospital: patient.hospital.name, // Suponiendo que `hospital` es un objeto con un campo `name`
    };
  }  

  // Función existente para exportar los reportes a Excel
  async exportReportsToExcel() {
    const reports = await this.reportRepository.find({
      relations: ["user"],
    });
  
    if (reports.length === 0) {
      throw new NotFoundException("No reports found");
    }
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Reports");
  
    // Añadir cabeceras
    worksheet.columns = [
      { header: "Fecha", key: "fecha", width: 15 },
      { header: "Paciente", key: "paciente", width: 20 },
      { header: "¿Tiene temperatura alta?", key: "temperatura", width: 30 },
      { header: "¿Tiene enrojecimiento?", key: "enrojecimiento", width: 30 },
      { header: "¿Tiene hinchazón?", key: "hinchazon", width: 30 },
      { header: "¿Tiene secreciones?", key: "secreciones", width: 30 },
      { header: "¿Tuvo gasto relacionado con la cirugía?", key: "tuvo_gasto", width: 50 },
      { header: "Monto aproximado de los gastos (en $)", key: "monto", width: 40 },
      { header: "Descripción", key: "descripcion", width: 50 },
      { header: "Tipo de cirugía", key: "tipoCirugia", width: 60 },
      { header: "Email", key: "email", width: 30 },
      { header: "Identificación", key: "identificacion", width: 20 },
      { header: "Edad", key: "edad", width: 10 },
      { header: "Dirección", key: "direccion", width: 40 },
      { header: "Teléfono personal", key: "telefonoPersonal", width: 20 },
      { header: "Teléfono de casa", key: "telefonoCasa", width: 20 },
      { header: "Hospital", key: "hospital", width: 30 },
    ];
  
    // Añadir los datos de los reportes
    for (const report of reports) {
      const patientInfo = await this.getPatientInformationById(report.user.id);
      const surgeryProcedure = await this.getSurgeryProcedureByUserId(report.user.id);

      console.log(patientInfo)
  
      worksheet.addRow({
        fecha: dayjs(report.createdAt).format("DD/MM/YYYY"),
        paciente: report.user.name + " " + report.user.lastname,
        temperatura: report.hasHighTemperature ? "Si" : "No",
        enrojecimiento: report.hasRedness ? "Si" : "No",
        hinchazon: report.hasSwelling ? "Si" : "No",
        secreciones: report.hasSecretions ? "Si" : "No",
        tuvo_gasto: report.surgeryExpense,
        monto: report.surgeryExpenseAmount,
        descripcion: report.additionalInformation,
        tipoCirugia: surgeryProcedure,
        email: patientInfo?.email || "No especificado", // Verificar si patientInfo es null
        identificacion: patientInfo?.identification || "No especificado",
        edad: patientInfo?.age || "No especificado",
        direccion: patientInfo?.address || "No especificado",
        telefonoPersonal: patientInfo?.personalPhone || "No especificado",
        telefonoCasa: patientInfo?.homePhone || "No especificado",
        hospital: patientInfo?.hospital || "No especificado",
      });
    }

    // Generar el archivo Excel en un buffer
    const uint8Array = await workbook.xlsx.writeBuffer();
    const buffer = Buffer.from(uint8Array);
    return buffer;
  }
}

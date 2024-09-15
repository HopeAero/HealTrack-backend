import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Employee } from "@src/core/employees/entities/employee.entity";
import { Notification } from "../entities/notification.entity";
import { Equal, IsNull, Not, Repository } from "typeorm";
import { CreateNotificationDto } from "../dto/create-notification.dto";
import { Patient } from "@src/core/patients/entities/patient.entity";
import { User } from "@src/core/users/entities/user.entity";
import * as ExcelJS from "exceljs";
import * as dayjs from "dayjs";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  // Crear notificación
  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const { title, message, employeeId, patientId } = createNotificationDto;

    // Verificar que el employeeId no sea nulo
    if (!employeeId) {
      throw new BadRequestException("Employee ID is required to create a notification");
    }

    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    // Verificar que el employeeId no sea nulo
    if (!patientId) {
      throw new BadRequestException("Patient ID is required to create a notification");
    }

    const patient = await this.patientRepository.findOne({ where: { id: patientId } });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    const notification = this.notificationRepository.create({
      title,
      message,
      employee,
      patient,
    });

    return this.notificationRepository.save(notification);
  }

  // Obtener todas las notificaciones
  async findAll(): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { deletedAt: null },
      relations: ["employee"],
    });
  }

  // Obtener todas las notificaciones incluyendo las eliminadas
  async findAllComplete(): Promise<Notification[]> {
    return this.notificationRepository.find({
      relations: ["employee"],
    });
  }

  // Obtener la lista de pacientes y la cantidad de veces que han pulsado el botón de pánico
  async getPanicButtonCounts(): Promise<
    {
      patient: Patient;
      user: User;
      panicCount: number;
    }[]
  > {
    // Primero, obtén todas las notificaciones que no están eliminadas
    const notifications = await this.notificationRepository.find({
      where: { deletedAt: null },
      relations: ["patient"],
    });

    // Crea un mapa para contar las notificaciones por paciente
    const patientPanicCounts = new Map<number, number>();

    // Recorre las notificaciones y cuenta las notificaciones por paciente
    for (const notification of notifications) {
      if (notification.patient) {
        const patientId = notification.patient.id;
        const currentCount = patientPanicCounts.get(patientId) || 0;
        patientPanicCounts.set(patientId, currentCount + 1);
      }
    }

    // Obtén los pacientes junto con sus usuarios
    const patients = await this.patientRepository.find({
      relations: ["user"],
    });

    // Crea una lista para almacenar los resultados
    const result = [];

    // Recorre los pacientes y agrega la información requerida
    for (const patient of patients) {
      const count = patientPanicCounts.get(patient.id) || 0;
      result.push({
        patient,
        user: patient.user,
        panicCount: Math.floor(count / 2),
      });
    }
    return result;
  }

  // Exportar pacientes y conteo de pánicos a Excel
  async exportPanicButtonCountsToExcel(): Promise<Buffer> {
    const data = await this.getPanicButtonCounts();

    // Crea un nuevo libro de trabajo
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Panic Button Counts");

    // Agrega las cabeceras
    worksheet.columns = [
      { header: "ID Paciente", key: "id", width: 15 },
      { header: "Nombre Completo", key: "fullName", width: 30 },
      { header: "Sexo", key: "sex", width: 15 },
      { header: "Veces que llamó al boton de pánico", key: "panicCount", width: 35 },
      { header: "Correo Electrónico", key: "email", width: 50 },
      { header: "Edad", key: "age", width: 5 },
      { header: "Cirugia", key: "surgery", width: 15 },
      { header: "Tipo de Cirugia", key: "surgeryType", width: 15 },
    ];

    // Agrega los datos
    data.forEach(({ patient, user, panicCount }) => {
      worksheet.addRow({
        id: patient.id,
        fullName: `${user.name} ${user.lastname}`,
        sex: patient.sex === "M" ? "Masculino" : "Femenino",
        panicCount,
        email: user.email,
        age: patient.age,
        surgery: patient.surgeryProcedure,
        surgeryType: patient.surgeryType === "A" ? "Electiva" : "Emergencia",
      });
    });

    // Genera el archivo Excel en formato Buffer
    const uint8Array = await workbook.xlsx.writeBuffer();
    const buffer = Buffer.from(uint8Array);
    return buffer;
  }

  // Obtener todas las notificaciones de un empleado
  async findNotificationsByEmployeeId(employeeId: number): Promise<Notification[]> {
    const employee = await this.employeeRepository.findOne({
      where: { user: { id: employeeId } },
      relations: ["notifications"],
      order: {
        notifications: {
          createdAt: "DESC",
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    // Filtra las notificaciones para que solo se devuelvan aquellas que no están eliminadas
    return employee.notifications.filter((notification) => notification.deletedAt === null);
  }

  // Obtener notificación por ID
  async findOne(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: Equal(id) },
      relations: ["employee"],
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  // Actualizar notificación
  async update(id: number, updateNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id);

    const updatedNotification = Object.assign(notification, updateNotificationDto);
    return this.notificationRepository.save(updatedNotification);
  }

  // Eliminar notificación
  async remove(id: number): Promise<void> {
    const notification = await this.findOne(id);

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    notification.deletedAt = new Date();
    notification.isRead = true;
    await this.notificationRepository.save(notification);
  }

  // Eliminar notificación con deleteAt
  async removeAllDeleted(): Promise<void> {
    const deletedNotifications = await this.notificationRepository.find({
      where: { deletedAt: Not(IsNull()) },
    });

    if (deletedNotifications.length > 0) {
      await this.notificationRepository.remove(deletedNotifications);
    }
  }

  // Eliminar todas las notificaciones de un empleado
  async removeAllByEmployeeId(employeeId: number): Promise<void> {
    const employee = await this.employeeRepository.findOne({
      where: { user: { id: employeeId } },
      relations: ["notifications"],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const notifications = employee.notifications.map((notification) => {
      notification.deletedAt = new Date();
      notification.isRead = true;
      return notification;
    });

    await this.notificationRepository.save(notifications);
  }

  // Obtener número de notificaciones sin leer para un empleado
  async countUnreadNotifications(employeeId: number): Promise<number> {
    return this.notificationRepository.count({
      where: { employee: { user: { id: employeeId } }, isRead: false, deletedAt: null },
    });
  }

  // Cambiar el isRead a True
  async markAsRead(id: number): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }
}

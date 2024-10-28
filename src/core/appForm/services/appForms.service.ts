import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AppFormulary } from "../entities/appForms.entity";
import { CreateAppFormularyDto } from "../dto/create-appForm.dto";
import { UserActiveInterface } from "@src/common/interface/user-active-interface";
import { Patient } from "@src/core/patients/entities/patient.entity";
import { UsersService } from "@src/core/users/service/users.service";
import { AllRole } from "@src/constants";

@Injectable()
export class AppFormularyService {
  constructor(
    @InjectRepository(AppFormulary)
    private readonly appFormularyRepository: Repository<AppFormulary>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly userService: UsersService,
  ) {}

  async create(createAppFormularyDto: CreateAppFormularyDto, user: UserActiveInterface): Promise<AppFormulary> {
    const activeUser = await this.userService.findOne(user.id);

    if (!activeUser) {
      throw new BadRequestException("Patient not found");
    }

    if (activeUser.role === AllRole.ASSISTANT || activeUser.role === AllRole.SPECIALIST) {
      createAppFormularyDto.isRespondingForEmployee = true;
    } else {
      createAppFormularyDto.isRespondingForEmployee = false;
    }

    // Validar que las respuestas estén dentro de la escala de Likert
    this.validateLikertResponses(createAppFormularyDto);

    const appFormulary = this.appFormularyRepository.create({
      ...createAppFormularyDto,
      user: activeUser,
      createdAt: new Date(),
    });

    return this.appFormularyRepository.save(appFormulary);
  }

  // Función para validar las respuestas en la escala de Likert
  private validateLikertResponses(createAppFormularyDto: CreateAppFormularyDto) {
    const likertScale = ["Totalmente en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Totalmente de acuerdo"];

    const responses = [
      createAppFormularyDto.likeApp,
      createAppFormularyDto.innescesaryDificultToUse,
      createAppFormularyDto.easyToUse,
      createAppFormularyDto.needExpertSupport,
      createAppFormularyDto.wellIntegratedFunctions,
      createAppFormularyDto.manyContradictions,
      createAppFormularyDto.peopleLearnQuickly,
      createAppFormularyDto.tediousToUse,
      createAppFormularyDto.feltConfidentUsing,
      createAppFormularyDto.neededKnowledgeBeforeUse,
    ];

    // Verificar que cada respuesta esté en la escala de Likert
    responses.forEach((response) => {
      if (!likertScale.includes(response)) {
        throw new BadRequestException(`Respuesta fuera de la escala de Likert: ${response}`);
      }
    });
  }

  async findAll(page: number = 1, limit: number = 5) {
    const query = this.appFormularyRepository
      .createQueryBuilder("appFormulary")
      .leftJoinAndSelect("appFormulary.user", "user");

    // Obtener el total de resultados sin paginación
    const total = await query.getCount();

    // Paginación
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const appFormularies = await query.getMany();

    // Calcular el total de páginas
    const totalPages = Math.ceil(total / limit);

    return {
      data: appFormularies,
      paginationData: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
      },
    };
  }

  async findOne(id: number): Promise<AppFormulary> {
    const appFormulary = await this.appFormularyRepository.findOne({
      where: { id },
      relations: ["user"],
    });

    if (!appFormulary) {
      throw new NotFoundException("AppFormulary not found");
    }

    return appFormulary;
  }

  // Función para calcular el porcentaje de satisfacción basado en las respuestas
  async calculateSatisfactionById(formId: number) {
    // Obtener el formulario basado en el ID
    const appFormulary = await this.appFormularyRepository.findOne({
      where: { id: formId },
    });

    if (!appFormulary) {
      throw new NotFoundException(`AppFormulary with ID ${formId} not found`);
    }

    // Mapa de valores de la escala de Likert normalizados a porcentajes
    const likertValues = {
      "Totalmente en desacuerdo": 0,
      "En desacuerdo": 0.25,
      Neutral: 0.5,
      "De acuerdo": 0.75,
      "Totalmente de acuerdo": 1,
    };

    // Respuestas del formulario
    const responses = [
      appFormulary.likeApp,
      appFormulary.innescesaryDificultToUse,
      appFormulary.easyToUse,
      appFormulary.needExpertSupport,
      appFormulary.wellIntegratedFunctions,
      appFormulary.manyContradictions,
      appFormulary.peopleLearnQuickly,
      appFormulary.tediousToUse,
      appFormulary.feltConfidentUsing,
      appFormulary.neededKnowledgeBeforeUse,
    ];

    // Sumar los valores correspondientes a cada respuesta
    const totalScore = responses.reduce((sum, response) => {
      return sum + (likertValues[response] || 0); // Usamos los valores normalizados
    }, 0);

    const maxScore = responses.length;
    const satisfactionPercentage = totalScore / maxScore;

    return satisfactionPercentage;
  }

  // Función para calcular el porcentaje de satisfacción de todos los formularios
  async calculateTotalSatisfaction(): Promise<number> {
    const allForms = await this.appFormularyRepository.find(); // Obtener todos los formularios

    if (allForms.length === 0) {
      throw new NotFoundException("No hay formularios disponibles para calcular la satisfacción");
    }

    // Calcular la satisfacción para cada formulario
    const satisfactionScores = await Promise.all(allForms.map((form) => this.calculateSatisfactionById(form.id)));

    // Sumar todos los puntajes de satisfacción
    const totalSatisfaction = satisfactionScores.reduce((sum, score) => sum + score, 0);

    // Calcular el promedio dividiendo por la cantidad de formularios
    const averageSatisfaction = totalSatisfaction / allForms.length;

    // Limitar el resultado a 4 decimales
    return parseFloat(averageSatisfaction.toFixed(4));
  }

  // Verifica si el usuario ya ha realizado un formulario.
  async hasUserSubmittedForm(userId: number): Promise<boolean> {
    // Busca si existe algún formulario asociado al usuario
    const existingForm = await this.appFormularyRepository.findOne({
      where: { user: { id: userId } },
    });

    // Retorna true si existe un formulario, false si no
    return existingForm !== null;
  }
}

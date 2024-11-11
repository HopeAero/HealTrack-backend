import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AppFormulary } from "../entities/appForms.entity";
import { CreateAppFormularyDto } from "../dto/create-appForm.dto";
import { UserActiveInterface } from "@src/common/interface/user-active-interface";
import { Patient } from "@src/core/patients/entities/patient.entity";
import { UsersService } from "@src/core/users/service/users.service";
import { AllRole } from "@src/constants";
import * as ExcelJS from "exceljs";
import * as dayjs from "dayjs";

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

    // Escala de Likert para contexto positivo
    const likertValuesPositive = {
      "Totalmente en desacuerdo": 0,
      "En desacuerdo": 0.25,
      Neutral: 0.5,
      "De acuerdo": 0.75,
      "Totalmente de acuerdo": 1,
    };

    // Escala de Likert para contexto negativo
    const likertValuesNegative = {
      "Totalmente en desacuerdo": 1,
      "En desacuerdo": 0.75,
      Neutral: 0.5,
      "De acuerdo": 0.25,
      "Totalmente de acuerdo": 0,
    };

    // Respuestas del formulario y contexto de cada pregunta
    const responsesWithContext = [
      { response: appFormulary.likeApp, isPositive: true },
      { response: appFormulary.innescesaryDificultToUse, isPositive: false },
      { response: appFormulary.easyToUse, isPositive: true },
      { response: appFormulary.needExpertSupport, isPositive: false },
      { response: appFormulary.wellIntegratedFunctions, isPositive: true },
      { response: appFormulary.manyContradictions, isPositive: false },
      { response: appFormulary.peopleLearnQuickly, isPositive: true },
      { response: appFormulary.tediousToUse, isPositive: false },
      { response: appFormulary.feltConfidentUsing, isPositive: true },
      { response: appFormulary.neededKnowledgeBeforeUse, isPositive: false },
    ];

    // Sumar los valores correspondientes a cada respuesta según su contexto
    const totalScore = responsesWithContext.reduce((sum, { response, isPositive }) => {
      const likertValues = isPositive ? likertValuesPositive : likertValuesNegative;
      return sum + (likertValues[response] || 0);
    }, 0);

    const maxScore = responsesWithContext.length;
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

  // Función existente para exportar los reportes a Excel
  async exportFormsToExcel() {
    // Obtener todos los formularios con la relación del usuario
    const forms = await this.appFormularyRepository.find({
      relations: ["user"],
    });

    if (forms.length === 0) {
      throw new NotFoundException("No forms found");
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("App Formularies");

    // Definir las cabeceras de las columnas
    worksheet.columns = [
      { header: "Fecha", key: "fecha", width: 15 },
      { header: "Paciente", key: "paciente", width: 20 },
      { header: "¿Le gusta la app?", key: "likeApp", width: 30 },
      { header: "¿Es innecesariamente difícil de usar?", key: "innescesaryDificultToUse", width: 40 },
      { header: "¿Es fácil de usar?", key: "easyToUse", width: 30 },
      { header: "¿Necesita soporte experto?", key: "needExpertSupport", width: 35 },
      { header: "¿Las funciones están bien integradas?", key: "wellIntegratedFunctions", width: 40 },
      { header: "¿Tiene muchas contradicciones?", key: "manyContradictions", width: 40 },
      { header: "¿Las personas aprenden rápidamente a usarla?", key: "peopleLearnQuickly", width: 40 },
      { header: "¿Es tediosa de usar?", key: "tediousToUse", width: 30 },
      { header: "¿Se siente seguro al usarla?", key: "feltConfidentUsing", width: 35 },
      { header: "¿Necesita conocimientos previos?", key: "neededKnowledgeBeforeUse", width: 40 },
    ];

    // Agregar los datos de los formularios al worksheet
    for (const form of forms) {
      worksheet.addRow({
        fecha: dayjs(form.createdAt).format("DD/MM/YYYY"),
        paciente: `${form.user.name} ${form.user.lastname}`,
        likeApp: form.likeApp,
        innescesaryDificultToUse: form.innescesaryDificultToUse,
        easyToUse: form.easyToUse,
        needExpertSupport: form.needExpertSupport,
        wellIntegratedFunctions: form.wellIntegratedFunctions,
        manyContradictions: form.manyContradictions,
        peopleLearnQuickly: form.peopleLearnQuickly,
        tediousToUse: form.tediousToUse,
        feltConfidentUsing: form.feltConfidentUsing,
        neededKnowledgeBeforeUse: form.neededKnowledgeBeforeUse,
      });
    }

    // Generar el archivo Excel en un buffer
    const uint8Array = await workbook.xlsx.writeBuffer();
    const buffer = Buffer.from(uint8Array);
    return buffer;
  }

  // Pregunta con mejor calificación total
  async getHighestRatedQuestions(): Promise<{ question: string; rating: number }[]> {
    const appForms = await this.appFormularyRepository.find(); // Obtener todos los formularios

    if (appForms.length === 0) {
      throw new NotFoundException("No hay formularios disponibles para calcular las preguntas mejor calificadas");
    }

    const likertScale: { [key: string]: number } = {
      "Totalmente en desacuerdo": 1,
      "En desacuerdo": 2,
      Neutral: 3,
      "De acuerdo": 4,
      "Totalmente de acuerdo": 5,
    };

    const questionRatings: { [key: string]: number } = {
      likeApp: 0,
      innescesaryDificultToUse: 0,
      easyToUse: 0,
      needExpertSupport: 0,
      wellIntegratedFunctions: 0,
      manyContradictions: 0,
      peopleLearnQuickly: 0,
      tediousToUse: 0,
      feltConfidentUsing: 0,
      neededKnowledgeBeforeUse: 0,
    };

    const totalResponses = appForms.length;

    // Sumar las calificaciones para cada pregunta
    appForms.forEach((form) => {
      for (const question in questionRatings) {
        questionRatings[question] += likertScale[form[question]] || 0;
      }
    });

    // Mapeo de preguntas
    const questionMapping: { [key: string]: string } = {
      likeApp: "¿Le gusta la app?",
      innescesaryDificultToUse: "¿Es innecesariamente difícil de usar?",
      easyToUse: "¿Es fácil de usar?",
      needExpertSupport: "¿Necesita soporte experto?",
      wellIntegratedFunctions: "¿Las funciones están bien integradas?",
      manyContradictions: "¿Tiene muchas contradicciones?",
      peopleLearnQuickly: "¿Las personas aprenden rápidamente a usarla?",
      tediousToUse: "¿Es tediosa de usar?",
      feltConfidentUsing: "¿Se siente seguro al usarla?",
      neededKnowledgeBeforeUse: "¿Necesita conocimientos previos?",
    };

    // Calcular la calificación promedio de cada pregunta y convertir a porcentaje
    const averageRatings = Object.keys(questionRatings).map((question) => {
      const averageRating = questionRatings[question] / totalResponses;
      const percentage = ((averageRating / 5) * 100).toFixed(2); // Convertir a porcentaje y redondear a 2 decimales
      return {
        question: questionMapping[question], // Mapeamos la clave al texto de la pregunta
        rating: parseFloat(percentage), // Almacenar como número
      };
    });

    // Encontrar el mayor porcentaje
    const maxRating = Math.max(...averageRatings.map((q) => q.rating));

    // Filtrar las preguntas que tienen el mayor porcentaje
    return averageRatings.filter((q) => q.rating === maxRating);
  }

  // Pregunta con peor calificación
  async getLowestRatedQuestions(): Promise<{ question: string; rating: number }[]> {
    const appForms = await this.appFormularyRepository.find(); // Obtener todos los formularios

    if (appForms.length === 0) {
      throw new NotFoundException("No hay formularios disponibles para calcular las preguntas con peor calificación");
    }

    const likertScale: { [key: string]: number } = {
      "Totalmente en desacuerdo": 1,
      "En desacuerdo": 2,
      Neutral: 3,
      "De acuerdo": 4,
      "Totalmente de acuerdo": 5,
    };

    const questionRatings: { [key: string]: number } = {
      likeApp: 0,
      innescesaryDificultToUse: 0,
      easyToUse: 0,
      needExpertSupport: 0,
      wellIntegratedFunctions: 0,
      manyContradictions: 0,
      peopleLearnQuickly: 0,
      tediousToUse: 0,
      feltConfidentUsing: 0,
      neededKnowledgeBeforeUse: 0,
    };

    const totalResponses = appForms.length;

    // Sumar las calificaciones para cada pregunta
    appForms.forEach((form) => {
      for (const question in questionRatings) {
        questionRatings[question] += likertScale[form[question]] || 0;
      }
    });

    // Mapeo de preguntas
    const questionMapping: { [key: string]: string } = {
      likeApp: "¿Le gusta la app?",
      innescesaryDificultToUse: "¿Es innecesariamente difícil de usar?",
      easyToUse: "¿Es fácil de usar?",
      needExpertSupport: "¿Necesita soporte experto?",
      wellIntegratedFunctions: "¿Las funciones están bien integradas?",
      manyContradictions: "¿Tiene muchas contradicciones?",
      peopleLearnQuickly: "¿Las personas aprenden rápidamente a usarla?",
      tediousToUse: "¿Es tediosa de usar?",
      feltConfidentUsing: "¿Se siente seguro al usarla?",
      neededKnowledgeBeforeUse: "¿Necesita conocimientos previos?",
    };

    // Calcular la calificación promedio de cada pregunta y convertir a porcentaje
    const averageRatings = Object.keys(questionRatings).map((question) => {
      const averageRating = questionRatings[question] / totalResponses;
      const percentage = ((averageRating / 5) * 100).toFixed(2); // Convertir a porcentaje y redondear a 2 decimales
      return {
        question: questionMapping[question], // Mapeamos la clave al texto de la pregunta
        rating: parseFloat(percentage), // Almacenar como número
      };
    });

    // Encontrar la peor calificación
    const lowestRating = Math.min(...averageRatings.map((q) => q.rating));

    // Filtrar las preguntas que tienen la peor calificación
    return averageRatings.filter((q) => q.rating === lowestRating);
  }

  // Porcentaje de aceptación de cada pregunta
  async getAcceptancePercentages(): Promise<{ question: string; percentage: number }[]> {
    const appForms = await this.appFormularyRepository.find(); // Obtener todos los formularios

    if (appForms.length === 0) {
      throw new NotFoundException("No hay formularios disponibles para calcular los porcentajes de aceptación");
    }

    const likertScale: { [key: string]: number } = {
      "Totalmente en desacuerdo": 1,
      "En desacuerdo": 2,
      Neutral: 3,
      "De acuerdo": 4,
      "Totalmente de acuerdo": 5,
    };

    const questionRatings: { [key: string]: number } = {
      likeApp: 0,
      innescesaryDificultToUse: 0,
      easyToUse: 0,
      needExpertSupport: 0,
      wellIntegratedFunctions: 0,
      manyContradictions: 0,
      peopleLearnQuickly: 0,
      tediousToUse: 0,
      feltConfidentUsing: 0,
      neededKnowledgeBeforeUse: 0,
    };

    const totalResponses = appForms.length;

    // Sumar las calificaciones para cada pregunta
    appForms.forEach((form) => {
      for (const question in questionRatings) {
        questionRatings[question] += likertScale[form[question]] || 0;
      }
    });

    // Mapeo de preguntas a sus descripciones
    const questionMapping: { [key: string]: string } = {
      likeApp: "¿Le gusta la app?",
      innescesaryDificultToUse: "¿Es innecesariamente difícil de usar?",
      easyToUse: "¿Es fácil de usar?",
      needExpertSupport: "¿Necesita soporte experto?",
      wellIntegratedFunctions: "¿Las funciones están bien integradas?",
      manyContradictions: "¿Tiene muchas contradicciones?",
      peopleLearnQuickly: "¿Pacientes aprenden rápido a usarla?",
      tediousToUse: "¿Es tediosa de usar?",
      feltConfidentUsing: "¿Se siente seguro al usarla?",
      neededKnowledgeBeforeUse: "¿Necesita conocimientos previos?",
    };

    // Calcular el porcentaje de aceptación de cada pregunta
    const acceptancePercentages = Object.keys(questionRatings).map((question) => {
      const averageRating = questionRatings[question] / totalResponses;
      const percentage = ((averageRating - 1) / 4) * 100; // Calcular el porcentaje respecto a la escala de 1 a 5
      return {
        question: questionMapping[question], // Mapeamos la clave al texto de la pregunta
        percentage: parseFloat(percentage.toFixed(2)), // Limitar a dos decimales
      };
    });

    return acceptancePercentages;
  }
}

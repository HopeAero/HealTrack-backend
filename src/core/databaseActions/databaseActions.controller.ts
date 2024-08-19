import { Controller, Get, Post, Body, Res, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { DatabaseActionsService } from './service/databaseActions.service';
import { ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('database-actions')
@Controller('database-actions')
export class DatabaseActionsController {
  constructor(private readonly databaseActionsService: DatabaseActionsService) {}

  @Get('export')
  async exportDatabase(@Res() res: Response): Promise<void> {
    try {
      const filePath = await this.databaseActionsService.exportDatabase();
      res.download(filePath);
    } catch (error) {
      res.status(500).send('Failed to export database');
    }
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importDatabase(@UploadedFile() file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No se ha subido ningún archivo');
    }

    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

    if (fileExtension !== 'sql') {
      throw new BadRequestException('Solo se permiten archivos con la extensión .sql');
    }

    try {
      // Asegúrate de que el archivo se guarda en una ubicación accesible
      const filePath = file.path; // O usa file.filename si usas una carpeta específica
      const result = await this.databaseActionsService.importDatabase(filePath);
      return result;
    } catch (error) {
      throw new Error(`Failed to import database: ${error.message}`);
    }
  }
}

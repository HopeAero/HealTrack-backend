import { Module } from '@nestjs/common';
import { DatabaseActionsService } from './service/databaseActions.service';
import { DatabaseActionsController } from './databaseActions.controller';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads', // Carpeta donde se guardarán los archivos
    }),
  ],
  providers: [DatabaseActionsService],
  controllers: [DatabaseActionsController],
})
export class DatabaseActionsModule {}

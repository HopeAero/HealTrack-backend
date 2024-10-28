import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppFormulary } from "./entities/appForms.entity";
import { UsersModule } from "../users/users.module";
import { AppFormularyService } from "./services/appForms.service";
import { AppFormularyController } from "./appForms.controller";
import { User } from "../users/entities/user.entity";
import { Patient } from "../patients/entities/patient.entity";

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([AppFormulary, User, Patient])],
  controllers: [AppFormularyController],
  providers: [AppFormularyService],
  exports: [AppFormularyService],
})
export class AppFormularyModule {}

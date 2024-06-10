import { Module } from "@nestjs/common";
import { ReportsController } from "./reports.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReportMedic } from "./entities/report.entity";
import { ReportsService } from "./service/reports.service";
import { UsersModule } from "../users/users.module";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: "./upload",
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
    UsersModule,
    TypeOrmModule.forFeature([ReportMedic]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}

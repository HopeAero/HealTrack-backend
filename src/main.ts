import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { json } from "express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { CORS } from "./constants";
import * as morgan from "morgan";

async function bootstrap() {
  const PORT = process.env.PORT || 3000;

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(json({ limit: "500mb" })); // Tamaño máximo de los datos

  app.use(morgan("dev"));

  app.enableCors(CORS);

  app.setGlobalPrefix("api/v1");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder() // Documentación
    .addBearerAuth()
    .setTitle("HealTrack API")
    .setDescription("Esta es la api de HealTrack")
    .addTag("patients")
    .addTag("employees")
    .addTag("chats")
    .addTag("reports")
    .addTag("auth")
    .build();

  const document = SwaggerModule.createDocument(app, config); // Documentación
  SwaggerModule.setup("api", app, document); // Documentación

  await app.listen(PORT);

  console.log(`Server running on port ${PORT}`);
}
bootstrap();

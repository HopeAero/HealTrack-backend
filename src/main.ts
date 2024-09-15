import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { json } from "express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { CORS } from "./constants";
import * as morgan from "morgan";
import * as express from "express";
import { join } from "path";

async function bootstrap() {
  const PORT = process.env.PORT || 3000;

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(json({ limit: "500mb" })); // Tamaño máximo de los datos

  app.use(morgan("dev"));

  app.enableCors(CORS);

  app.setGlobalPrefix("api/v1");

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        function extractErrors(errors) {
          return errors.reduce((acc, error) => {
            if (error.children && error.children.length > 0) {
              acc.push(...extractErrors(error.children));
            } else {
              acc.push({
                property: error.property,
                message: error.constraints
                  ? error.constraints[Object.keys(error.constraints)[0]]
                  : "Error no especificado",
              });
            }
            return acc;
          }, []);
        }

        const result = extractErrors(errors);
        return new BadRequestException(result);
      },
      stopAtFirstError: true,
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use("/upload", express.static(join(__dirname, "..", "upload")));

  const config = new DocumentBuilder() // Documentación
    .addBearerAuth()
    .setTitle("HealTrack API")
    .setDescription("Esta es la api de HealTrack")
    .addTag("patients")
    .addTag("employees")
    .addTag("chats")
    .addTag("notification")
    .addTag("reports")
    .addTag("auth")
    .build();

  const document = SwaggerModule.createDocument(app, config); // Documentación
  SwaggerModule.setup("api", app, document); // Documentación

  await app.listen(PORT);

  console.log(`Server running on port ${PORT}`);
}
bootstrap();

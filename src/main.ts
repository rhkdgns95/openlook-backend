import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SocketIoAdapter } from "./adapter";
import { AppModule } from "./module";

function setupSwagger(app: NestExpressApplication, projectVersion: string) {
  const config = new DocumentBuilder()
    .setTitle("openlook-server REST API")
    .setDescription("openlook-server REST API")
    .setVersion(projectVersion)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/apidoc", app, document);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: console,
  });
  const projectVersion: string = require("project-version");
  app.setGlobalPrefix("/api");
  app.useWebSocketAdapter(new SocketIoAdapter(app, true));
  app.enableCors({
    credentials: true,
  });
  setupSwagger(app, projectVersion);

  await app.listen(3001);
}
bootstrap();

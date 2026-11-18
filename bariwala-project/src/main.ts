import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform:true,
      whitelist:true,
      forbidNonWhitelisted:true
    })
  )
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Bariwala API")
    .setDescription("Bariwala rental property management API")
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app,swaggerConfig)
  SwaggerModule.setup('api/docs',app,document)
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();

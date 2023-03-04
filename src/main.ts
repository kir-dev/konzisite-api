import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import 'dotenv/config'
import { AppModule } from './app.module'

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production'
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: isProduction
      ? ['log', 'error', 'warn']
      : ['log', 'error', 'warn', 'debug'],
  })

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  )
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  const config = new DocumentBuilder()
    .setTitle('Konzisite API')
    .setDescription('Konzisite API')
    .setVersion(process.env.npm_package_version || '0.1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  if (!isProduction) {
    SwaggerModule.setup('api', app, document)
  }

  app.enableCors({
    origin: process.env.FRONTEND_HOST,
  })

  await app.listen(process.env.BACKEND_PORT || 3000)
}
bootstrap()

import { NestFactory } from '@nestjs/core'
import 'dotenv/config'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({
    origin: process.env.FRONTEND_HOST,
  })
  await app.listen(process.env.BACKEND_PORT || 3000)
}
bootstrap()

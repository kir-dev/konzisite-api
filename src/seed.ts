import { NestFactory } from '@nestjs/core'
import { Seeder } from './seed/seeder'
import { SeederModule } from './seed/seeder.module'

async function bootstrap() {
  const seederApp = await NestFactory.createApplicationContext(SeederModule)
  await seederApp.get(Seeder).seed()
}

bootstrap()

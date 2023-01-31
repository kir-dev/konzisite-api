import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    return `Konzisite REST API ${
      process.env.VERSION ? 'v' + process.env.VERSION : 'in Development mode'
    } © ${new Date().getFullYear()} Kir-Dev`
  }
}

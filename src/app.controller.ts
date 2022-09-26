import { Get } from '@nestjs/common'
import { ApiController } from 'src/utils/apiController.decorator'
import { AppService } from './app.service'

@ApiController()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }
}

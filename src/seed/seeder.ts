import { Injectable } from '@nestjs/common'
import { SeederService } from './seeder.service'

@Injectable()
export class Seeder {
  constructor(private readonly seederService: SeederService) {}

  async seed() {
    const groupId = await this.seederService.createBasics()
    await this.seederService.createKonziForGroup(groupId)
    await this.seederService.createOtherKonzi()
  }
}

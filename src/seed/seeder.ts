import { Injectable, Logger } from '@nestjs/common'
import { SeederService } from './seeder.service'

@Injectable()
export class Seeder {
  constructor(
    private readonly logger: Logger,
    private readonly seederService: SeederService,
  ) {}

  async seed() {
    if (!this.seederService.checkIfDbEmpty()) {
      this.logger.warn("The database isn't empty, aborting seeding.")
      return
    }
    const groupId = await this.seederService.createBasics()
    await this.seederService.createKonziForGroup(groupId)
    await this.seederService.createOtherKonzi()
  }
}

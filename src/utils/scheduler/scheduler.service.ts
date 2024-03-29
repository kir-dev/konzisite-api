import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { unlink } from 'fs'
import { join } from 'path'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class SchedulerService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(SchedulerService.name)

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async deleteOldFiles() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const consultations = await this.prisma.consultation.findMany({
      where: {
        AND: [{ fileName: { not: null } }, { endDate: { lte: thirtyDaysAgo } }],
      },
    })
    consultations.forEach((c) => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      unlink(join(process.cwd(), '/static', c.fileName), () => {})
    })
    const result = await this.prisma.consultation.updateMany({
      where: {
        AND: [{ fileName: { not: null } }, { endDate: { lte: thirtyDaysAgo } }],
      },
      data: {
        fileName: null,
        archived: true,
      },
    })
    this.logger.log(`${result.count} file(s) deleted`)
  }
}

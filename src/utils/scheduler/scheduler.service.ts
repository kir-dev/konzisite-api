import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression, Interval } from '@nestjs/schedule'
import { unlink } from 'fs'
import { join } from 'path'
import { PrismaService } from 'src/prisma/prisma.service'
import { Intervals } from './IntervalExpressions'

@Injectable()
export class SchedulerService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(SchedulerService.name)
  @Interval(5 * Intervals.minutes)
  handleCron() {
    this.logger.debug('Scheduling is active')
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async deleteOldFiles() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const consultations = await this.prisma.consultation.findMany({
      where: {
        AND: [{ fileName: { not: null } }, { endDate: { lte: thirtyDaysAgo } }],
      },
    })
    consultations.forEach((c) => {
      unlink(join(process.cwd(), '/static', c.fileName), () => {})
    })
    const result = await this.prisma.consultation.updateMany({
      where: {
        AND: [{ fileName: { not: null } }, { endDate: { lte: thirtyDaysAgo } }],
      },
      data: {
        fileName: null,
      },
    })
    this.logger.log(`${result.count} file(s) deleted`)
  }
}

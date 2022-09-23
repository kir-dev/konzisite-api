import { Injectable, Logger } from '@nestjs/common'
import { Interval } from '@nestjs/schedule'
import { Intervals } from './IntervalExpressions'

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name)
  @Interval(5 * Intervals.minutes)
  handleCron() {
    this.logger.debug('Scheduling is active')
  }
}

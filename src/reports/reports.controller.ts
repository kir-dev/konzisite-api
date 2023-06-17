import {
  BadRequestException,
  Get,
  Param,
  ParseIntPipe,
  Query,
  StreamableFile,
} from '@nestjs/common'
import { Permissions } from 'src/auth/casl-ability.factory'
import { AuthorizationSubject } from 'src/auth/decorator/authorizationSubject.decorator'
import { CurrentUser } from 'src/auth/decorator/current-user.decorator'
import { JwtAuth } from 'src/auth/decorator/jwtAuth.decorator'
import { RequiredPermission } from 'src/auth/decorator/requiredPermission'
import { UserEntity } from 'src/users/dto/UserEntity.dto'
import { ApiController } from 'src/utils/apiController.decorator'
import { ReportsService } from './reports.service'

@AuthorizationSubject('User')
@ApiController('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('/validate/:id')
  async validateReport(@Param('id') id: string) {
    const reportData = await this.reportsService.getReport(id)
    return this.reportsService.generateReportHTML(reportData)
  }

  @JwtAuth()
  @Get('user-report')
  async getUserReport(
    @CurrentUser() user: UserEntity,
    @Query('startDate', ParseIntPipe) startDate: number,
    @Query('endDate', ParseIntPipe) endDate: number,
  ): Promise<StreamableFile> {
    if (startDate >= endDate) {
      throw new BadRequestException('Invalid date range!')
    }
    if (endDate > Date.now()) {
      throw new BadRequestException(
        'Invalid date range! You can only generate reports based on consultations in the past.',
      )
    }
    return new StreamableFile(
      await this.reportsService.generateUserReport(
        user,
        new Date(startDate),
        new Date(endDate),
      ),
    )
  }

  @JwtAuth()
  @Get('admin-report')
  @RequiredPermission(Permissions.GenerateAdminReport)
  async getAdminReport(
    @Query('startDate', ParseIntPipe) startDate: number,
    @Query('endDate', ParseIntPipe) endDate: number,
  ): Promise<StreamableFile> {
    if (startDate >= endDate) {
      throw new BadRequestException('Invalid date range!')
    }
    if (endDate > Date.now()) {
      throw new BadRequestException(
        'Invalid date range! You can only generate reports based on consultations in the past.',
      )
    }
    return new StreamableFile(
      await this.reportsService.generateAdminReport(
        new Date(startDate),
        new Date(endDate),
      ),
    )
  }
}

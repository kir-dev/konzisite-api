import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common'
import { Permissions } from 'src/auth/casl-ability.factory'
import { AuthorizationSubject } from 'src/auth/decorator/authorizationSubject.decorator'
import { CurrentUser } from 'src/auth/decorator/current-user.decorator'
import { JwtAuth } from 'src/auth/decorator/jwtAuth.decorator'
import { RequiredPermission } from 'src/auth/decorator/requiredPermission'
import { UserEntity } from 'src/users/dto/UserEntity.dto'
import { CreateRequestDto } from './dto/CreateRequest.dto'
import { RequestDetailsDto } from './dto/RequestDetails.dto'
import { RequestPreviewDto } from './dto/RequestPreview.dto'
import { UpdateRequestDto } from './dto/UpdateRequest.dto'
import { RequestsService } from './requests.service'

@JwtAuth()
@Controller('requests')
@AuthorizationSubject('ConsultationRequest')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get()
  async findAll(): Promise<RequestPreviewDto[]> {
    return this.requestsService.findAll()
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RequestDetailsDto> {
    try {
      return this.requestsService.findOne(id)
    } catch {
      throw new HttpException(
        'A konzi kérés nem található!',
        HttpStatus.NOT_FOUND,
      )
    }
  }

  @Post()
  async create(
    @Body() createRequest: CreateRequestDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.requestsService.create(createRequest, user)
  }

  @Patch(':id')
  @RequiredPermission(Permissions.Update)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRequestDto,
  ) {
    return this.requestsService.update(id, dto)
  }

  @Delete(':id')
  @RequiredPermission(Permissions.Delete)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.requestsService.remove(id)
  }

  @Post(':id/support')
  async support(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const request = await this.requestsService.findOne(id)

    if (request.initializer.id == user.id) {
      throw new HttpException(
        'A saját konzi kérésedet nem támogathatod!',
        HttpStatus.BAD_REQUEST,
      )
    }

    if (request.supporters.some((s) => s.id == user.id)) {
      throw new HttpException(
        'Ezt a kérést már táogatod!',
        HttpStatus.BAD_REQUEST,
      )
    }

    return this.requestsService.addSupporter(id, user)
  }

  @Post(':id/unsupport')
  async unsupport(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const request = await this.requestsService.findOne(id)

    if (request.initializer.id == user.id) {
      throw new HttpException(
        'A saját konzi kérésedet nem támogathatod!',
        HttpStatus.BAD_REQUEST,
      )
    }

    if (!request.supporters.some((s) => s.id == user.id)) {
      throw new HttpException(
        'Ezt a kérést már nem táogatod!',
        HttpStatus.BAD_REQUEST,
      )
    }

    return this.requestsService.removeSupporter(id, user)
  }
}

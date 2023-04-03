import {
  BadRequestException,
  Body,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { Permissions } from 'src/auth/casl-ability.factory'
import { AuthorizationSubject } from 'src/auth/decorator/authorizationSubject.decorator'
import { CurrentUser } from 'src/auth/decorator/current-user.decorator'
import { JwtAuth } from 'src/auth/decorator/jwtAuth.decorator'
import { RequiredPermission } from 'src/auth/decorator/requiredPermission'
import { UserEntity } from 'src/users/dto/UserEntity.dto'
import { ApiController } from 'src/utils/apiController.decorator'
import { CreateRequestDto } from './dto/CreateRequest.dto'
import { RequestDetailsDto } from './dto/RequestDetails.dto'
import { RequestEntity } from './dto/RequestEntity.dto'
import { RequestPreviewDto } from './dto/RequestPreview.dto'
import { UpdateRequestDto } from './dto/UpdateRequest.dto'
import { RequestsService } from './requests.service'

@JwtAuth()
@ApiController('requests')
@AuthorizationSubject('ConsultationRequest')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get()
  async findAll(@CurrentUser() user: UserEntity): Promise<RequestPreviewDto[]> {
    return this.requestsService.findAll(true, user)
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RequestDetailsDto> {
    return this.requestsService.findOne(id)
  }

  @Post()
  async create(
    @Body() createRequest: CreateRequestDto,
    @CurrentUser() user: UserEntity,
  ): Promise<RequestEntity> {
    try {
      return await this.requestsService.create(createRequest, user)
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2003' || e.code === 'P2025') {
          throw new BadRequestException('Nincs ilyen azonosítójú tárgy!')
        }
      }
      throw e
    }
  }

  @Patch(':id')
  @RequiredPermission(Permissions.Update)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRequestDto,
  ): Promise<RequestEntity> {
    try {
      return await this.requestsService.update(id, dto)
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2003' || e.code === 'P2025') {
          throw new BadRequestException('Nincs ilyen azonosítójú tárgy!')
        }
      }
      throw e
    }
  }

  @Delete(':id')
  @RequiredPermission(Permissions.Delete)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<RequestEntity> {
    return this.requestsService.remove(id)
  }

  @Post(':id/support')
  async support(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RequestEntity> {
    const request = await this.requestsService.findOne(id)

    if (request.initializer.id === user.id) {
      throw new BadRequestException('A saját konzi kérésedet nem támogathatod!')
    }

    if (request.supporters.some((s) => s.id === user.id)) {
      throw new BadRequestException('Ezt a kérést már támogatod!')
    }

    return this.requestsService.addSupporter(id, user)
  }

  @Post(':id/unsupport')
  async unsupport(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RequestEntity> {
    const request = await this.requestsService.findOne(id)

    if (request.initializer.id === user.id) {
      throw new BadRequestException('A saját konzi kérésedet nem támogathatod!')
    }

    if (!request.supporters.some((s) => s.id === user.id)) {
      throw new BadRequestException('Ezt a kérést már nem támogatod!')
    }

    return this.requestsService.removeSupporter(id, user)
  }
}

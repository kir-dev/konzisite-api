import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUserDto } from './dto/CreateUser.dto'
import { UpdateUserDto } from './dto/UpdateUser.dto'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(nameFilter?: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        fullName: {
          contains: nameFilter ?? '',
          mode: 'insensitive',
        },
      },
    })
  }

  async findOne(id: number): Promise<User> {
    return this.prisma.user.findUnique({ where: { id: id } })
  }

  async findByAuthSchId(authSchId: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { authSchId: authSchId } })
  }

  async create(data: CreateUserDto): Promise<User> {
    return this.prisma.user.create({ data })
  }

  async update(id: number, data: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({ data, where: { id: id } })
  }

  async promoteUser(id: number): Promise<User> {
    return this.prisma.user.update({
      data: { isAdmin: true },
      where: { id: id },
    })
  }

  async remove(id: number): Promise<User> {
    return this.prisma.user.delete({ where: { id: id } })
  }
}

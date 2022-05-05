import { Injectable } from '@nestjs/common'
import { Prisma, User } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data })
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany()
  }

  async findOne(id: number): Promise<User> {
    return this.prisma.user.findUnique({ where: { id: id } })
  }

  async findByAuthSchId(authSchId: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { authSchId: authSchId } })
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ data, where: { id: id } })
  }

  async remove(id: number): Promise<User> {
    return this.prisma.user.delete({ where: { id: id } })
  }
}

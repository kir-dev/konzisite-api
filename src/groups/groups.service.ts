import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}
  create(data: Prisma.GroupUncheckedCreateInput) {
    return this.prisma.group.create({ data })
  }

  findAll() {
    return this.prisma.group.findMany({
      include: {
        owner: true,
        members: {
          select: {
            user: true,
          },
        },
      },
    })
  }

  findOne(id: number) {
    return this.prisma.group.findUnique({
      where: { id },
      include: {
        owner: true,
        members: {
          select: {
            user: true,
          },
        },
      },
    })
  }

  update(id: number, data: Prisma.GroupUncheckedUpdateInput) {
    return this.prisma.group.update({ where: { id }, data })
  }

  remove(id: number) {
    return this.prisma.group.delete({ where: { id } })
  }

  addMember(groupId: number, userId: number) {
    return this.prisma.userToGroup.create({
      data: { userId, groupId },
    })
  }

  addManyMembers(groupId: number, userIds: number[]) {
    return this.prisma.userToGroup.createMany({
      data: userIds.map((userId) => ({ userId, groupId })),
    })
  }

  removeMember(groupId: number, userId: number) {
    return this.prisma.userToGroup.delete({
      where: { userId_groupId: { userId, groupId } },
    })
  }
}

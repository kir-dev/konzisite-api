import { Injectable } from '@nestjs/common'
import { GroupRole, Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { AllGroups } from './dto/AllGroups.dto'

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}
  create(data: Prisma.GroupUncheckedCreateInput) {
    return this.prisma.group.create({ data })
  }

  async findAll(userId: number) {
    const groups = await this.prisma.group.findMany({
      include: {
        owner: true,
        _count: {
          select: {
            members: true,
          },
        },
        members: {
          where: {
            userId,
          },
        },
      },
    })
    return groups
      .map(({ members, _count, ...g }) => ({
        ...g,
        memberCount: _count.members,
        currentUserRole: members.length > 0 ? members[0].role : GroupRole.NONE,
      }))
      .map((g) => new AllGroups(g))
  }

  async findOne(id: number, userId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        owner: true,
        members: {
          select: {
            user: true,
            joinedAt: true,
            role: true,
          },
        },
      },
    })
    return {
      ...group,
      members: group.members.map(({ user, ...membership }) => ({
        ...user,
        ...membership,
      })),
      currentUserRole: group.members.find((m) => m.user.id === userId).role,
    }
  }

  update(id: number, data: Prisma.GroupUncheckedUpdateInput) {
    return this.prisma.group.update({ where: { id }, data })
  }

  remove(id: number) {
    return this.prisma.group.delete({ where: { id } })
  }

  addMember(groupId: number, userId: number, role: GroupRole) {
    return this.prisma.userToGroup.create({
      data: { userId, groupId, role },
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

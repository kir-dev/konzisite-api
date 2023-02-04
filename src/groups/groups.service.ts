import { Injectable } from '@nestjs/common'
import { GroupRole, Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserEntity } from 'src/users/dto/UserEntity.dto'
import { CreateGroupDto } from './dto/CreateGroup.dto'
import { GroupRoles } from './dto/GroupEntity.dto'

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number, nameFilter?: string) {
    const groups = await this.prisma.group.findMany({
      include: {
        owner: true,
        _count: {
          select: {
            members: {
              where: {
                role: {
                  in: [GroupRoles.ADMIN, GroupRoles.OWNER, GroupRoles.MEMBER],
                },
              },
            },
          },
        },
        members: {
          where: {
            userId,
          },
        },
      },
      where: {
        name: {
          contains: nameFilter ?? '',
          mode: 'insensitive',
        },
      },
    })
    return groups.map(({ members, _count, ...g }) => ({
      ...g,
      memberCount: _count.members,
      currentUserRole: members.length > 0 ? members[0].role : GroupRole.NONE,
    }))
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
      currentUserRole:
        group.members.find((m) => m.user.id === userId)?.role ||
        GroupRoles.NONE,
    }
  }

  create(dto: CreateGroupDto, user: UserEntity) {
    return this.prisma.group.create({ data: { ...dto, ownerId: user.id } })
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

  findMember(groupId: number, userId: number) {
    return this.prisma.userToGroup.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    })
  }

  setMemberRole(groupId: number, userId: number, role: GroupRole) {
    return this.prisma.userToGroup.update({
      where: {
        userId_groupId: { userId, groupId },
      },
      data: {
        role,
      },
    })
  }

  setSubscribe(userId: number, groupId: number, value: boolean) {
    return this.prisma.userToGroup.update({
      where: {
        userId_groupId: { userId, groupId },
      },
      data: {
        isSubscribed: value,
      },
    })
  }
}

import { AbilityBuilder, PureAbility } from '@casl/ability'
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma'
import { Injectable } from '@nestjs/common'
import {
  Consultation,
  ConsultationRequest,
  Group,
  Subject,
  User,
} from '@prisma/client'
import { GroupRoles } from 'src/groups/dto/GroupEntity.dto'
import { PrismaService } from 'src/prisma/prisma.service'

export type AppSubjects = Subjects<{
  User: User
  Group: Group
  Subject: Subject
  Consultation: Consultation
  ConsultationRequest: ConsultationRequest
}>

type AppAbility = PureAbility<[string, AppSubjects], PrismaQuery>

export enum Permissions {
  Manage = 'manage', // all permissions
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  AddMember = 'add_member',
  ApproveMember = 'approve_member',
  PromoteMember = 'promote_member',
}

@Injectable()
export class CaslAbilityFactory {
  constructor(private prisma: PrismaService) {}

  createForGroup = async (user: User, groupId: number) => {
    const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility)

    if (user.isAdmin) {
      can(Permissions.Manage, 'Group')
    }

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { members: { where: { userId: user.id } } },
    })

    if (group?.ownerId === user.id) {
      can(Permissions.Update, 'Group')
      can(Permissions.Delete, 'Group')
      can(Permissions.PromoteMember, 'Group')
    }

    if (
      group?.members.length > 0 &&
      [GroupRoles.OWNER, GroupRoles.ADMIN].includes(group?.members[0].role)
    ) {
      can(Permissions.AddMember, 'Group')
      can(Permissions.ApproveMember, 'Group')
    }
    return build()
  }
}

import { AbilityBuilder, PureAbility } from '@casl/ability'
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
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
  PromoteUser = 'promote_user',
  DownloadFile = 'download_file',
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

    if (group === null) {
      throw new HttpException('A csoport nem található!', HttpStatus.NOT_FOUND)
    }

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

  createForSubject = (user: User) => {
    const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility)

    if (user.isAdmin) {
      can(Permissions.Manage, 'Subject')
    }

    return build()
  }

  createForUser = (currentUser: User, userIdToManage: number) => {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createPrismaAbility,
    )
    if (currentUser.id === userIdToManage) {
      can(Permissions.Manage, 'User')
    }

    if (currentUser.isAdmin) {
      can(Permissions.Manage, 'User')
    } else {
      cannot(Permissions.PromoteUser, 'User')
    }
    return build()
  }

  createForConsultationMutation = async (
    user: User,
    consultationId: number,
  ) => {
    const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility)

    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { presentations: true },
    })

    if (consultation === null) {
      throw new HttpException(
        'A konzultáció nem található!',
        HttpStatus.NOT_FOUND,
      )
    }

    if (user.isAdmin) {
      can(Permissions.Manage, 'Consultation')
    }

    if (
      user.id === consultation.ownerId ||
      consultation.presentations.map((p) => p.userId).includes(user.id)
    ) {
      can(Permissions.Update, 'Consultation')
      can(Permissions.Delete, 'Consultation')
      can(Permissions.DownloadFile, 'Consultation')
    }

    const participation = await this.prisma.participation.findUnique({
      where: { consultationId_userId: { consultationId, userId: user.id } },
      include: { ratings: true },
    })

    if (participation && participation.ratings.length > 0) {
      can(Permissions.DownloadFile, 'Consultation')
    }

    return build()
  }

  createForConsultationRead = (user?: User) => {
    const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility)
    can(Permissions.Read, 'Consultation', { targetGroups: { none: {} } })
    if (user) {
      can(Permissions.Read, 'Consultation', {
        OR: [
          {
            targetGroups: {
              some: {
                members: {
                  some: {
                    userId: user.id,
                    role: {
                      in: [
                        GroupRoles.MEMBER,
                        GroupRoles.ADMIN,
                        GroupRoles.OWNER,
                      ],
                    },
                  },
                },
              },
            },
          },
          { presentations: { some: { userId: user.id } } },
          { ownerId: user.id },
        ],
      })
    }
    return build()
  }
}

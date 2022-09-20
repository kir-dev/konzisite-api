import { Injectable, Logger } from '@nestjs/common'
import { GroupRoles } from 'src/groups/dto/GroupEntity.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { seededConsultations } from './data/consultations'
import { seededGroup } from './data/groups'
import { seededSubjects } from './data/subjects'
import { seededUsers } from './data/users'

@Injectable()
export class SeederService {
  constructor(private readonly logger: Logger, private prisma: PrismaService) {}

  async createBasics() {
    let data = await this.prisma.user.createMany({ data: seededUsers })
    this.logger.log(`${data.count} users created.`)
    data = await this.prisma.subject.createMany({ data: seededSubjects })
    this.logger.log(`${data.count} subjects created.`)
    const group = await this.prisma.group.create({
      data: {
        ...seededGroup,
        ownerId: 1,
        members: {
          create: [
            {
              userId: 1,
              role: GroupRoles.OWNER,
            },
            {
              userId: 2,
              role: GroupRoles.MEMBER,
            },
            {
              userId: 3,
              role: GroupRoles.PENDING,
            },
            {
              userId: 4,
              role: GroupRoles.ADMIN,
            },
          ],
        },
      },
    })
    if (group) {
      this.logger.log(`1 group created.`)
    } else {
      this.logger.error('Group creation failed')
    }
    return group.id
  }

  async createKonziForGroup(groupId: number) {
    const { id, ...konziData } = seededConsultations[0]
    let data: any = await this.prisma.consultation.create({
      data: {
        ...konziData,
        owner: {
          connect: {
            id: 1,
          },
        },
        subject: {
          connect: {
            id: 1,
          },
        },
        targetGroups: {
          connect: {
            id: groupId,
          },
        },
        presentations: {
          create: {
            id: 1,
            userId: 1,
          },
        },
        participants: {
          create: {
            id: 1,
            userId: 2,
          },
        },
      },
    })
    if (data) {
      this.logger.log(`1 consultation created.`)
    } else {
      this.logger.error('Consultation creation failed')
    }
    data = await this.prisma.rating.create({
      data: {
        participationId: 1,
        presentationId: 1,
        value: 4,
        text: 'Egész jó volt!',
        anonymous: false,
      },
    })
    if (data) {
      this.logger.log(`1 rating created.`)
    } else {
      this.logger.error('Rating creation failed')
    }
  }

  async createOtherKonzi() {
    const { id, ...konziData } = seededConsultations[1]
    const data = await this.prisma.consultation.create({
      data: {
        ...konziData,
        owner: {
          connect: {
            id: 5,
          },
        },
        subject: {
          connect: {
            id: 4,
          },
        },
        presentations: {
          create: [
            {
              id: 2,
              userId: 1,
            },
            {
              id: 3,
              userId: 2,
            },
          ],
        },
        participants: {
          create: [
            {
              id: 2,
              userId: 3,
            },
            {
              id: 3,
              userId: 4,
            },
            {
              id: 4,
              userId: 5,
            },
          ],
        },
      },
    })
    if (data) {
      this.logger.log(`1 consultation created.`)
    } else {
      this.logger.error('Consultation creation failed')
    }
    const manyData = await this.prisma.rating.createMany({
      data: [
        {
          participationId: 2,
          presentationId: 2,
          value: 4,
          text: 'Egész érthető volt',
          anonymous: false,
        },
        {
          participationId: 2,
          presentationId: 3,
          value: 1,
          text: 'Nem tudom minek volt ott, nem tett hozzá semmit',
          anonymous: true,
        },
        {
          participationId: 3,
          presentationId: 2,
          value: 5,
          text: 'Pacek',
          anonymous: true,
        },
        {
          participationId: 3,
          presentationId: 3,
          value: 4,
          text: 'Gánya',
          anonymous: false,
        },
      ],
    })
    this.logger.log(`${manyData.count} ratings created.`)
  }

  async checkIfDbEmpty() {
    const counts: number[] = []
    counts.push(await this.prisma.user.count())
    counts.push(await this.prisma.group.count())
    counts.push(await this.prisma.subject.count())
    counts.push(await this.prisma.consultation.count())
    counts.push(await this.prisma.presentation.count())
    counts.push(await this.prisma.participation.count())
    counts.push(await this.prisma.rating.count())
    return !counts.find((n) => n > 0)
  }
}

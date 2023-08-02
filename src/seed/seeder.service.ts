import { Injectable, Logger } from '@nestjs/common'
import { GroupRoles } from 'src/groups/dto/GroupEntity.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { seededConsultations } from './data/consultations'
import { seededGroup } from './data/groups'
import { seededSubjects } from './data/subjects'
import { seededUsers } from './data/users'

@Injectable()
export class SeederService {
  constructor(
    private readonly logger: Logger,
    private prisma: PrismaService,
  ) {}

  async createBasics() {
    let data = await this.prisma.user.createMany({ data: seededUsers })
    this.logger.log(`${data.count} users created.`)
    data = await this.prisma.subject.createMany({ data: seededSubjects })
    this.logger.log(`${data.count} subjects created.`)
    const group = await this.prisma.group.create({
      data: {
        ...seededGroup,
        ownerId: 1000001,
        members: {
          create: [
            {
              userId: 1000001,
              role: GroupRoles.OWNER,
            },
            {
              userId: 1000002,
              role: GroupRoles.MEMBER,
            },
            {
              userId: 1000003,
              role: GroupRoles.PENDING,
            },
            {
              userId: 1000004,
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...konziData } = seededConsultations[0]
    let data: any = await this.prisma.consultation.create({
      data: {
        ...konziData,
        owner: {
          connect: {
            id: 1000001,
          },
        },
        subject: {
          connect: {
            id: 1000001,
          },
        },
        targetGroups: {
          connect: {
            id: groupId,
          },
        },
        presentations: {
          create: {
            id: 1000001,
            userId: 1000001,
          },
        },
        participants: {
          create: {
            id: 1000001,
            userId: 1000002,
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
        participationId: 1000001,
        presentationId: 1000001,
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...konziData } = seededConsultations[1]
    const data = await this.prisma.consultation.create({
      data: {
        ...konziData,
        owner: {
          connect: {
            id: 1000005,
          },
        },
        subject: {
          connect: {
            id: 1000004,
          },
        },
        presentations: {
          create: [
            {
              id: 1000002,
              userId: 1000001,
            },
            {
              id: 1000003,
              userId: 1000002,
            },
          ],
        },
        participants: {
          create: [
            {
              id: 1000002,
              userId: 1000003,
            },
            {
              id: 1000003,
              userId: 1000004,
            },
            {
              id: 1000004,
              userId: 1000005,
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
          participationId: 1000002,
          presentationId: 1000002,
          value: 4,
          text: 'Egész érthető volt',
          anonymous: false,
        },
        {
          participationId: 1000002,
          presentationId: 1000003,
          value: 1,
          text: 'Nem tudom minek volt ott, nem tett hozzá semmit',
          anonymous: true,
        },
        {
          participationId: 1000003,
          presentationId: 1000002,
          value: 5,
          text: 'Pacek',
          anonymous: true,
        },
        {
          participationId: 1000003,
          presentationId: 1000003,
          value: 4,
          text: 'Gánya',
          anonymous: false,
        },
      ],
    })
    this.logger.log(`${manyData.count} ratings created.`)
  }
}

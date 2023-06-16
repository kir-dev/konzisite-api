import { Injectable } from '@nestjs/common'
import {
  Consultation,
  Participation,
  Presentation,
  Rating,
  Subject,
} from '@prisma/client'
import * as ejs from 'ejs'
import { readFileSync } from 'fs'
import puppeteer from 'puppeteer'
import { PrismaService } from 'src/prisma/prisma.service'
import {
  ConsultationForReport,
  ConsultationReportDateInfo,
  Report,
} from 'src/templates/types/Report'
import { publicUserProjection } from 'src/utils/publicUserProjection'
import { UserEntity } from './dto/UserEntity.dto'

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async generateUserReport(user: UserEntity, startDate: Date, endDate: Date) {
    const consultations = await this.prisma.consultation.findMany({
      where: {
        presentations: {
          some: {
            userId: user.id,
          },
        },
        startDate: { gte: startDate },
        endDate: { lte: endDate },
      },
      include: {
        subject: true,
        participants: true,
        presentations: {
          include: {
            ratings: true,
            user: publicUserProjection,
          },
        },
      },
    })

    return this.generateReportPDF({
      user,
      consultations: consultations.map(this.formatConsultationForReport),
      ...this.generateDateInfo(startDate, endDate),
      konzisiteUrl: process.env.FRONTEND_HOST,
    })
  }

  async generateAdminReport(startDate: Date, endDate: Date) {
    const consultations = await this.prisma.consultation.findMany({
      where: {
        startDate: { gte: startDate },
        endDate: { lte: endDate },
      },
      include: {
        subject: true,
        participants: true,
        presentations: {
          include: {
            ratings: true,
            user: publicUserProjection,
          },
        },
      },
    })

    return this.generateReportPDF({
      consultations: consultations.map(this.formatConsultationForReport),
      ...this.generateDateInfo(startDate, endDate),
      konzisiteUrl: process.env.FRONTEND_HOST,
    })
  }

  private async generateReportPDF(data: Report): Promise<Buffer> {
    // As of implementation, this uses the old headless mode of chrome, which is far quicker than the new one
    // At some point, by default the new one will be to used, if there is an option we should stick to the old one, unless the speed difference disappears
    // More info: https://github.com/puppeteer/puppeteer/issues/10071
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    const file = readFileSync(
      process.env.MAIL_TEMPLATE_ROOT + 'report.ejs',
    ).toString()
    const html = ejs.render(file, data)
    await page.setContent(html, { waitUntil: 'networkidle0' })
    await page.emulateMediaType('screen')
    const pdf = await page.pdf({
      printBackground: true,
      format: 'A4',
    })
    await browser.close()
    return pdf
  }

  private formatConsultationForReport({
    startDate,
    endDate,
    ...c
  }: ConsultationForReportBeforeFormat): ConsultationForReport {
    return {
      ...c,
      date: startDate.toLocaleDateString('hu-HU', {
        dateStyle: 'short',
      }),
      startTime: startDate.toLocaleTimeString('hu-HU', {
        timeStyle: 'short',
      }),
      endTime: endDate.toLocaleTimeString('hu-HU', {
        timeStyle: 'short',
      }),
      participants: c.participants.length,
      presentations: c.presentations.map((p) => {
        const avgRating =
          p.ratings.reduce((acc, val) => acc + val.value, 0) /
            c.presentations[0].ratings.length || 0
        return {
          ...p.user,
          averageRating:
            avgRating > 0 ? avgRating.toFixed(2) : 'nincs értékelve',
        }
      }),
    }
  }

  private generateDateInfo(
    startDate: Date,
    endDate: Date,
  ): ConsultationReportDateInfo {
    return {
      startDate: startDate.toLocaleDateString('hu-HU', {
        dateStyle: 'short',
      }),
      endDate: endDate.toLocaleDateString('hu-HU', {
        dateStyle: 'short',
      }),
      currentDateTime: new Date().toLocaleString('hu-HU', {
        timeStyle: 'short',
        dateStyle: 'short',
      }),
    }
  }
}

type ConsultationForReportBeforeFormat = Consultation & {
  presentations: (Presentation & {
    ratings: Rating[]
    user: {
      fullName: string
      id: number
    }
  })[]
  participants: Participation[]
  subject: Subject
}

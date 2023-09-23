import { Injectable } from '@nestjs/common'
import {
  Consultation,
  Participation,
  Presentation,
  Rating,
  Subject,
} from '@prisma/client'
import { createHash } from 'crypto'
import * as ejs from 'ejs'
import { readFileSync } from 'fs'
import puppeteer from 'puppeteer'
import { PrismaService } from 'src/prisma/prisma.service'
import {
  ConsultationForReport,
  ConsultationReportDateInfo,
  Report,
} from 'src/templates/types/Report'
import { UserEntity } from 'src/users/dto/UserEntity.dto'
import { publicUserProjection } from 'src/utils/publicUserProjection'

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateReport(startDate: Date, endDate: Date, user?: UserEntity) {
    const consultations = await this.prisma.consultation.findMany({
      where: {
        presentations: {
          some: {
            userId: user?.id,
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
      orderBy: {
        startDate: 'asc',
      },
    })

    return this.generateReportPDF({
      user,
      consultations: consultations.map(this.formatConsultationForReport),
      ...this.generateDateInfo(startDate, endDate),
      konzisiteUrl: process.env.FRONTEND_HOST,
      validated: false,
    })
  }

  async getReport(id: string) {
    return this.prisma.report.findUnique({ where: { id } })
  }

  generateReportHTML(data: Report): string {
    const file = readFileSync(
      process.env.MAIL_TEMPLATE_ROOT + 'report.ejs',
    ).toString()
    return ejs.render(file, {
      ...data,
      validated: true,
    })
  }

  generateInvalidReportHTML(): string {
    const file = readFileSync(
      process.env.MAIL_TEMPLATE_ROOT + 'invalidReport.ejs',
    ).toString()
    return ejs.render(file, {
      konzisiteUrl: process.env.FRONTEND_HOST,
    })
  }

  private async generateReportPDF(data: Report): Promise<Buffer> {
    const jsonString = JSON.stringify(data)
    const hash = createHash('md5').update(jsonString).digest('hex')
    const [, browser] = await Promise.all([
      this.prisma.report.create({
        data: { id: hash, jsonData: jsonString },
      }),
      // As of implementation, this uses the old headless mode of chrome, which is far quicker than the new one
      // At some point, by default the new one will be to used, if there is an option we should stick to the old one, unless the speed difference disappears
      // More info: https://github.com/puppeteer/puppeteer/issues/10071
      puppeteer.launch({
        executablePath: ['production', 'staging', 'docker'].includes(
          process.env.NODE_ENV,
        )
          ? 'google-chrome-stable'
          : undefined,
      }),
    ])
    const page = await browser.newPage()
    const file = readFileSync(
      process.env.MAIL_TEMPLATE_ROOT + 'report.ejs',
    ).toString()
    const html = ejs.render(file, {
      ...data,
      validateUrl: `${process.env.BACKEND_HOST}/reports/validate/${hash}`,
    })

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
            p.ratings.length || 0
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
    const now = new Date()
    return {
      startDate: startDate.toLocaleDateString('hu-HU', {
        dateStyle: 'short',
      }),
      endDate: endDate.toLocaleDateString('hu-HU', {
        dateStyle: 'short',
      }),
      currentDateTime: now.toLocaleString('hu-HU', {
        timeStyle: 'medium',
        dateStyle: 'short',
      }),
      currentTimestamp: now.getTime(), // to make sure that two reports won't get the same hash
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

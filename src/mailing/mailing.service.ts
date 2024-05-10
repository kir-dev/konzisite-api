import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import * as ejs from 'ejs'
import { existsSync, readFileSync } from 'fs'

import { subject } from '@casl/ability'
import { OnEvent } from '@nestjs/event-emitter'
import { CaslAbilityFactory, Permissions } from 'src/auth/casl-ability.factory'
import { PrismaService } from 'src/prisma/prisma.service'
import {
  RequestFulfilledEvent,
  RequestFulfilledKey,
} from './events/RequestFulfilled'
import { MailingModule } from './mailing.module'

type Templates = Record<string, string> & { default: string }

interface SendMail {
  to: string
  from: string
  subject: string
  html: string
}

export interface Setup {
  templates: Templates
  apiKey: string
  mailServerUrl: string
}

class SetupIncompleteException extends Error {
  message = `You need to set up ${MailingService.name} through ${MailingModule.name} in order to properly use it!`
}

class TemplateNotFoundException extends Error {
  constructor(templateName: string) {
    super(`Template "${templateName}" not found. Check the setup process!`)
  }
}

@Injectable()
export class MailingService {
  static templates: Templates = { default: '' }
  static mailServerUrl = ''
  static apiKey = ''
  static setupComplete = false
  private readonly logger = new Logger(MailingService.name)

  constructor(
    private readonly prisma: PrismaService,
    private caslFactory: CaslAbilityFactory,
  ) {}

  /**
   * Sets up everything for MailingService. This reads in all the templates in order to speed up sending and to check if the files exist.
   * @param templates - Object in which the keys are the names of the template and the value is the path of the template.
   * @param mailServerUrl - The endpoint of the service which will handle the delivery of the e-mail.
   * @param apiKey - The API key for the server (X-Api-Key value).
   */
  static setup({ templates, mailServerUrl, apiKey }: Setup) {
    MailingService.templates = Object.entries(templates).reduce(
      (accumulator: Templates, [name, path]) => {
        if (!existsSync(path)) throw new Error('Template not found for ' + name)
        accumulator[name] = readFileSync(path).toString()
        return accumulator
      },
      { default: readFileSync(templates.default).toString() },
    )
    if (!apiKey) throw 'API key is not provided for Mailing Service'
    if (!mailServerUrl)
      throw 'Mail server URL is not provided for Mailing Service'
    MailingService.apiKey = apiKey
    MailingService.mailServerUrl = mailServerUrl
    MailingService.setupComplete = true
    Logger.log(
      `Loaded ${Object.keys(templates).length} e-mail template(s)`,
      this.name,
    )
  }

  /**
   * Generates an HTML code for the given template filled in with values you provide.
   * @param values - The values you might refer to in your EJS file. This is not type checked!
   * @param templateName - One of the template names you provided during the setup process.
   */
  generateMail(
    values: unknown,
    templateName: keyof typeof MailingService.templates = 'default',
  ) {
    MailingService.checkSetup()

    const template = MailingService.templates[templateName]
    if (!template) throw new TemplateNotFoundException(templateName)

    return ejs.render(MailingService.templates[templateName], values)
  }

  /**
   * Sends a mail through the mailing delivery service provided in the setup process.
   * @param {SendMail[]} data - Array of objects containing to, from, subject and html string fields.
   */
  sendMail(data: SendMail[]) {
    MailingService.checkSetup()
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(
        `The app would be sending ${data.length} email(s) right now, but email sending is only enabled in production.`,
      )
      return Promise.resolve(false)
    }
    return axios
      .post(MailingService.mailServerUrl, data, {
        headers: { 'X-Api-Key': MailingService.apiKey },
      })
      .then(() => {
        this.logger.log(
          `${data.length} email data sent to Kir-Dev email service`,
        )
        return true
      })
      .catch((e) => {
        this.logger.log('Error during email sending')
        this.logger.error(e)
        return false
      })
  }

  private static checkSetup() {
    if (!MailingService.setupComplete) throw new SetupIncompleteException()
  }

  @OnEvent(RequestFulfilledKey)
  async handleRequestFulfilled(payload: RequestFulfilledEvent) {
    // we already had the request and consultation objects in this execution, but we need different projections and joins compared to the objects the API returns
    // we need the supporters, including their email address
    const requestQuery = this.prisma.consultationRequest.findUnique({
      where: { id: payload.requestId },
      include: { initializer: true, supporters: true, subject: true },
    })
    // and we need the target groups and their members of the consultation so that we only send the email to those who can view it
    const consultationQuery = this.prisma.consultation.findUnique({
      where: { id: payload.consultationId },
      include: {
        targetGroups: {
          include: {
            members: true,
          },
        },
        presentations: true,
        owner: true,
      },
    })

    const [request, consultation] = await Promise.all([
      requestQuery,
      consultationQuery,
    ])

    this.sendMail(
      [...request.supporters, request.initializer]
        .filter((u) => {
          if (!u.email) return false
          const ability = this.caslFactory.createForConsultationRead(u)
          return ability.can(
            Permissions.Read,
            subject('Consultation', consultation),
          )
        })
        .map((u) => {
          const html = this.generateMail({
            firstName: u.firstName,
            subjectName: request.subject.name,
            consultationUrl: `${process.env.FRONTEND_HOST}/consultations/${consultation.id}`,
          })
          return {
            from: 'Konzisite',
            to: u.email,
            subject: 'Megvalósul egy konzi kérésed!',
            html,
          }
        }),
    )
  }
}

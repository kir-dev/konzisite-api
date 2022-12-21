import { SetMetadata } from '@nestjs/common'
import { AppSubjects } from 'src/auth/casl-ability.factory'

export const AuthorizationSubject = (subject: AppSubjects) =>
  SetMetadata('subject', subject)

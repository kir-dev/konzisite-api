import { SetMetadata } from '@nestjs/common'
import { Permissions } from 'src/auth/casl-ability.factory'

export const RequiredPermission = (permission: Permissions) =>
  SetMetadata('permission', permission)

export class GroupEntity {
  id: number
  name: string
  createdAt: Date
}

export const GroupRoles: {
  [x: string]: 'PENDING' | 'MEMBER' | 'ADMIN' | 'OWNER' | 'NONE'
} = {
  PENDING: 'PENDING',
  MEMBER: 'MEMBER',
  ADMIN: 'ADMIN',
  OWNER: 'OWNER',
  NONE: 'NONE',
}

export type GroupRoles = typeof GroupRoles[keyof typeof GroupRoles]

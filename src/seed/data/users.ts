import { UserEntity } from 'src/users/dto/UserEntity.dto'

export const seededUsers: UserEntity[] = [
  {
    id: 1000001,
    authSchId: 'de8ec047-65bf-4dab-ba8f-df75a345413d',
    firstName: 'Jakab',
    fullName: 'Gipsz Jakab',
    email: 'gipsz@jakab.eu',
    isAdmin: true,
  },
  {
    id: 1000002,
    authSchId: '97c6eab6-1e23-4b8c-89c3-118a32769544',
    firstName: 'John',
    fullName: 'Doe John',
    email: 'john@doe.eu',
    isAdmin: false,
  },
  {
    id: 1000003,
    authSchId: '332692c0-d1ac-4914-b726-a3ed41002f2f',
    firstName: 'Feri',
    fullName: 'Azabizonyos Feri',
    email: 'milyen@feri.eu',
    isAdmin: false,
  },
  {
    id: 1000004,
    authSchId: '8f236dfb-5999-457a-b092-c5c86e5a0783',
    firstName: 'Elek',
    fullName: 'Teszt Elek',
    email: 'teszt.elek@gmail.eu',
    isAdmin: false,
  },
  {
    id: 1000005,
    authSchId: '6445f246-c174-4f4b-a125-f96a82b7ce2e',
    firstName: 'Foo',
    fullName: 'Bar Foo',
    email: 'foo@bar.eu',
    isAdmin: false,
  },
]

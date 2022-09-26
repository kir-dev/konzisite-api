import { UserEntity } from 'src/users/dto/UserEntity.dto'

export const seededUsers: UserEntity[] = [
  {
    id: 1000001,
    authSchId: 'de8ec047-65bf-4dab-ba8f-df75a345413d',
    firstName: 'Jakab',
    lastName: 'Gipsz',
    email: 'gipsz@jakab.eu',
  },
  {
    id: 1000002,
    authSchId: '97c6eab6-1e23-4b8c-89c3-118a32769544',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@doe.eu',
  },
  {
    id: 1000003,
    authSchId: '332692c0-d1ac-4914-b726-a3ed41002f2f',
    firstName: 'Feri',
    lastName: 'Azabizonyos',
    email: 'milyen@feri.eu',
  },
  {
    id: 1000004,
    authSchId: '8f236dfb-5999-457a-b092-c5c86e5a0783',
    firstName: 'Elek',
    lastName: 'Teszt',
    email: 'teszt.elek@gmail.eu',
  },
  {
    id: 1000005,
    authSchId: '6445f246-c174-4f4b-a125-f96a82b7ce2e',
    firstName: 'Foo',
    lastName: 'Bar',
    email: 'foo@bar.eu',
  },
]

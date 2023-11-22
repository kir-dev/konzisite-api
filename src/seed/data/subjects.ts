import { SubjectEntity } from 'src/subject/dto/SubjectEntity.dto'

export const seededSubjects: SubjectEntity[] = [
  {
    id: 1000001,
    code: 'VITMAB04',
    name: 'Adatbázisok',
    englishName: 'Databases',
    majors: ['CE_BSC'],
  },
  {
    id: 1000002,
    code: 'VIHVA214',
    name: 'Jelek és rendszerek',
    majors: ['EE_BSC'],
  },
  {
    id: 1000003,
    code: 'GT20A001',
    name: 'Menedzsment és vállalkozásgazdaságtan',
    majors: ['CE_BSC', 'EE_BSC', 'BPROF'],
  },
  {
    id: 1000004,
    code: 'VIIIAB07',
    name: 'Számítógépes grafika',
    englishName: 'Computer graphics',
    majors: ['CE_BSC'],
  },
]

import { SubjectEntity } from 'src/subject/dto/SubjectEntity.dto'

export const seededSubjects: SubjectEntity[] = [
  {
    id: 1,
    code: 'VITMAB04',
    name: 'Adatbázisok',
    majors: ['CE_BSC'],
  },
  {
    id: 2,
    code: 'VIHVA214',
    name: 'Jelek és rendszerek',
    majors: ['EE_BSC'],
  },
  {
    id: 3,
    code: 'GT20A001',
    name: 'Menedzsment és vállalkozásgazdaságtan',
    majors: ['CE_BSC', 'EE_BSC', 'BPROF'],
  },
  {
    id: 4,
    code: 'VIIIAB07',
    name: 'Számítógépes grafika',
    majors: ['CE_BSC'],
  },
]

import { ConsultationEntity } from 'src/consultations/dto/ConsultationEntity.dto'

export const seededConsultations: ConsultationEntity[] = [
  {
    id: 1000001,
    name: 'Adatb ZH felkészülés',
    location: 'SCH-1317',
    startDate: new Date(Date.now() - 3 * 60 * 60 * 1000),
    endDate: new Date(Date.now() - 60 * 60 * 1000),
    descMarkdown: 'Eskü jó lesz',
  },
  {
    id: 1000002,
    name: 'Grafika házi help',
    location: 'Discord',
    startDate: new Date(Date.now() - 60 * 60 * 1000),
    endDate: new Date(Date.now() + 60 * 60 * 1000),
    descMarkdown: 'Nem kapsz plágiumot eskü',
  },
  {
    id: 1000003,
    name: 'Menedzsment gyakorlás',
    location: 'FNT',
    startDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 50 * 26 * 60 * 60 * 1000),
    descMarkdown: 'mondjuk ezen nem tudom mit',
  },
]

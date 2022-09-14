export const Major: {
  [x: string]:
    | 'CE_BSC'
    | 'EE_BSC'
    | 'BPROF'
    | 'CE_MSC'
    | 'EE_MSC'
    | 'BI_MSC'
    | 'HI_MSC'
} = {
  CE_BSC: 'CE_BSC',
  EE_BSC: 'EE_BSC',
  BPROF: 'BPROF',
  CE_MSC: 'CE_MSC',
  EE_MSC: 'EE_MSC',
  BI_MSC: 'BI_MSC',
  HI_MSC: 'HI_MSC',
}

export type Major = typeof Major[keyof typeof Major]

export class SubjectEntity {
  id: number
  code: string
  name: string
  majors: Major[]
}

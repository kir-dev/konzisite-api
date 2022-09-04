export enum Major {
  CE_BSC,
  EE_BSC,
  BPROF,
  CE_MSC,
  EE_MSC,
  BI_MSC,
  HI_MSC,
}

export class SubjectEntity {
  id: number
  code: string
  name: string
  majors: Major[]
}

import { ArrayMinSize, IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator'

export const Major: {
  [x: string]:
    | 'CE_BSC'
    | 'EE_BSC'
    | 'BPROF'
    | 'CE_MSC'
    | 'EE_MSC'
    | 'BI_MSC'
    | 'HI_MSC'
    | 'SE_MSC'
} = {
  CE_BSC: 'CE_BSC',
  EE_BSC: 'EE_BSC',
  BPROF: 'BPROF',
  CE_MSC: 'CE_MSC',
  EE_MSC: 'EE_MSC',
  BI_MSC: 'BI_MSC',
  HI_MSC: 'HI_MSC',
  SE_MSC: 'SE_MSC',
}

export type Major = typeof Major[keyof typeof Major]

export class SubjectEntity {
  @IsInt()
  @Min(1)
  id: number

  @IsNotEmpty()
  code: string

  @IsNotEmpty()
  name: string

  @ArrayMinSize(1)
  @IsEnum(Major, { each: true })
  majors: Major[]
}

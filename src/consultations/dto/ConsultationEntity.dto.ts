import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator'

export const Language: {
  [x: string]: 'hu' | 'en'
} = {
  hu: 'hu',
  en: 'en',
}
export type Language = (typeof Language)[keyof typeof Language]

export class ConsultationEntity {
  @IsInt()
  @Min(1)
  id: number

  @IsNotEmpty()
  @MaxLength(100)
  name: string

  @IsNotEmpty()
  @MaxLength(100)
  location: string

  @IsDateString()
  startDate: Date

  @IsDateString()
  endDate: Date

  @IsOptional()
  @MaxLength(5000)
  descMarkdown?: string

  @IsOptional()
  fileName?: string

  @IsBoolean()
  archived: boolean

  @IsEnum(Language)
  language: Language
}

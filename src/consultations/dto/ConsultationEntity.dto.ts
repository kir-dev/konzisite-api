import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator'

export class ConsultationEntity {
  @IsInt()
  @Min(1)
  id: number

  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  location: string

  @IsDateString()
  startDate: Date

  @IsDateString()
  endDate: Date

  @IsOptional()
  descMarkdown: string

  @IsOptional()
  fileName?: string

  @IsBoolean()
  archived: boolean
}

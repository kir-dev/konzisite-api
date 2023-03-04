import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator'

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
}

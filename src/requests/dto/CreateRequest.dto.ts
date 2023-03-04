import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator'

export class CreateRequestDto {
  @IsNotEmpty()
  @MaxLength(100)
  name: string

  @IsInt()
  @Min(1)
  subjectId: number

  @IsOptional()
  @MaxLength(5000)
  descMarkdown: string

  @IsDateString()
  expiryDate: Date
}

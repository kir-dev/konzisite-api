import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator'

export class CreateRequestDto {
  @IsNotEmpty()
  name: string

  @IsInt()
  @Min(1)
  subjectId: number

  @IsOptional()
  descMarkdown: string

  @IsDateString()
  expiryDate: Date
}

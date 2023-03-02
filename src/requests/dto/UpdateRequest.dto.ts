import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator'

export class UpdateRequestDto {
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(100)
  name: string

  @IsInt()
  @Min(1)
  @IsOptional()
  subjectId: number

  @IsOptional()
  @MaxLength(5000)
  descMarkdown: string

  @IsDateString()
  @IsOptional()
  expiryDate: Date
}

import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator'

export class UpdateRequestDto {
  @IsNotEmpty()
  @IsOptional()
  name: string

  @IsInt()
  @Min(1)
  @IsOptional()
  subjectId: number

  @IsOptional()
  descMarkdown: string

  @IsDateString()
  @IsOptional()
  expiryDate: Date
}

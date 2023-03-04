import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator'

export class RequestEntity {
  @IsInt()
  @Min(1)
  id: number

  @IsNotEmpty()
  @MaxLength(100)
  name: string

  @IsOptional()
  @MaxLength(5000)
  descMarkdown: string

  @IsDateString()
  expiryDate: Date
}

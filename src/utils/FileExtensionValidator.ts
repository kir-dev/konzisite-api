import { FileValidator } from '@nestjs/common'
import { unlink } from 'fs'
import { extname, join } from 'path'

export class FileExtensionValidator extends FileValidator<{
  allowedExtensions: string[]
}> {
  isValid(file?: Express.Multer.File): boolean | Promise<boolean> {
    return this.validationOptions.allowedExtensions.includes(
      extname(file.originalname),
    )
  }
  buildErrorMessage(file: Express.Multer.File): string {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    unlink(join(process.cwd(), '/static', file.filename), () => {})
    return `Érvénytelen kiterjesztés: ${extname(
      file.originalname,
    )}! Megengedett kiterjesztések: ${this.validationOptions.allowedExtensions.join(
      ', ',
    )}`
  }
}

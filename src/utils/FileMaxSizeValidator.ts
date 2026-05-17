import { FileValidator, PayloadTooLargeException } from '@nestjs/common'
import { unlink } from 'fs/promises'
import { join } from 'path'

export class FileMaxSizeValidator extends FileValidator<{ maxSize: number }> {
  isValid(file?: Express.Multer.File): boolean {
    return file.size <= this.validationOptions.maxSize
  }

  buildErrorMessage(file: Express.Multer.File): string {
    void unlink(join(process.cwd(), '/static', file.filename))
    throw new PayloadTooLargeException(
      `A fájl mérete maximum ${
        this.validationOptions.maxSize / 1000000
      } MB lehet!`,
    )
  }
}

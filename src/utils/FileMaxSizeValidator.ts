import { FileValidator, PayloadTooLargeException } from '@nestjs/common'
import { unlink } from 'fs'
import { join } from 'path'

export class FileMaxSizeValidator extends FileValidator<{ maxSize: number }> {
  isValid(file?: Express.Multer.File): boolean | Promise<boolean> {
    return file.size <= this.validationOptions.maxSize
  }

  buildErrorMessage(file: Express.Multer.File): string {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    unlink(join(process.cwd(), '/static', file.filename), () => {})
    throw new PayloadTooLargeException(
      `A fájl mérete maximum ${
        this.validationOptions.maxSize / 1000000
      } MB lehet!`,
    )
  }
}

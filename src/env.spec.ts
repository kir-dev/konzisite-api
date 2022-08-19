import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from './app.module'

describe('Testing environment', () => {
  let app: TestingModule

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
  })

  it.each(['DATABASE_URL', 'JWT_SECRET', 'BACKEND_PORT', 'AUTHSCH_CLIENT_ID'])(
    '%s should not be defined',
    (envVar) => {
      expect(process.env[envVar]).toBeUndefined()
      return app.close()
    },
  )
})

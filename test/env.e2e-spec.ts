/*
  Testing environment should be independent of the developers environment
*/

describe('Testing environment', () => {
  beforeAll(() => {
    jest.mock('@prisma/client', () => {
      return {
        PrismaClient: jest.fn().mockImplementation(() => {
          return {}
        }),
      }
    })

    jest.mock('src/auth/auth.module', () => {
      return {
        AuthModule: jest.fn().mockImplementation(() => {
          return {}
        }),
      }
    })
  })

  describe('JWT_SECRET', () => {
    it('should not be defined', () => {
      expect(process.env.JWT_SECRET).not.toBeDefined()
    })
  })

  describe('DATABASE_URL', () => {
    it('should not be defined', () => {
      expect(process.env.DATABASE_URL).not.toBeDefined()
    })
  })

  describe('AUTHSCH_CLIENT_ID', () => {
    it('should not be defined', () => {
      expect(process.env.AUTHSCH_CLIENT_ID).not.toBeDefined()
    })
  })
})

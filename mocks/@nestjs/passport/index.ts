import * as originalModule from '../../../node_modules/@nestjs/passport'

module.exports = {
  __esModule: true,
  ...originalModule,
  AuthGuard: jest.fn(() => class {}),
  PassportStrategy: jest.fn(() => class {}),
}

import { Str } from '@cloudflare/itty-router-openapi'

export interface IUserData {
  access_accounts: string[]
  access_token: string
  role: string
  user_name: string
}

export const openAPICreateUser = {
  access_token: new Str(),
  role: new Str({ example: 'admin' }),
  user_name: new Str(),
}

export const openAPIUpdateUser = {
  access_accounts: [new Str()],
}

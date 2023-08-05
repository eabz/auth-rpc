import { Buffer } from 'node:buffer'

import { IEnv, IUserData } from '@/types'
import {
  errorInvalidAuthUserNotFound,
  errorInvalidAuthUserRoleMismatch,
  errorInvalidAuthUserTokenMismatch,
  errorInvalidToken,
  getUserFromToken,
} from '@/utils'

export function decodeToken(authToken?: string): { token: string; user: string } | undefined {
  if (!authToken || authToken === '') return

  const separatedToken = authToken.split(' ')
  if (separatedToken.length !== 2) {
    return
  }

  const buff = Buffer.from(separatedToken[1], 'base64')

  const auth = buff.toString()

  const [user, token] = auth.split(':')

  return { token, user }
}

export async function checkAuth(
  env: IEnv,
  authToken: string,
  role?: string,
): Promise<{ error?: string; user?: IUserData }> {
  const token = decodeToken(authToken)
  if (!token) {
    return { error: errorInvalidToken }
  }

  const user = await getUserFromToken(env, authToken)
  if (!user) {
    return { error: errorInvalidAuthUserNotFound }
  }

  if (role && user.role !== role) {
    return { error: errorInvalidAuthUserRoleMismatch }
  }

  if (user.access_token !== token.token) {
    return { error: errorInvalidAuthUserTokenMismatch }
  }

  return { user }
}

import { Buffer } from 'node:buffer'

import { apiError } from '@/responses'
import { IEnv, IUserData } from '@/types'
import {
  errorInvalidAuthUserNotFound,
  errorInvalidAuthUserRoleMismatch,
  errorInvalidAuthUserTokenMismatch,
  errorInvalidToken,
} from '@/utils'

export async function checkAuth(env: IEnv, authToken: string, role: string): Promise<Response | undefined> {
  const separatedToken = authToken.split(' ')
  if (separatedToken.length !== 2) {
    return apiError(errorInvalidToken, 401)
  }

  const buff = Buffer.from(separatedToken[1], 'base64')

  const auth = buff.toString()

  const [user, userAuthToken] = auth.split(':')

  const dbUserData = await env.USERS.get(user)
  if (!dbUserData) {
    return apiError(errorInvalidAuthUserNotFound, 401)
  }

  const userData: IUserData = JSON.parse(dbUserData)
  if (userData.role !== role) {
    return apiError(errorInvalidAuthUserRoleMismatch, 401)
  }

  if (userData.access_token !== userAuthToken) {
    return apiError(errorInvalidAuthUserTokenMismatch, 401)
  }

  return
}

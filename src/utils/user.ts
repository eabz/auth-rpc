import { IEnv, IUserData } from '@/types'
import { decodeToken } from '@/utils'

export async function getUserFromToken(env: IEnv, authToken: string): Promise<IUserData | undefined> {
  const token = decodeToken(authToken)
  if (!token) {
    return
  }

  const dbUserData = await env.USERS.get(token.user)
  if (!dbUserData) {
    return
  }

  return JSON.parse(dbUserData)
}

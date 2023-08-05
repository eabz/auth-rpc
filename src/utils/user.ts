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

export async function getUser(env: IEnv, userName: string): Promise<IUserData | undefined> {
  const dbUserData = await env.USERS.get(userName)
  if (!dbUserData) {
    return
  }

  return JSON.parse(dbUserData)
}

export async function storeUser(env: IEnv, user: IUserData) {
  await env.USERS.put(user.user_name.toLowerCase(), JSON.stringify(user))
}

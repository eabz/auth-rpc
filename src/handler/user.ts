import { Header, OpenAPIRoute, Path, Str } from '@cloudflare/itty-router-openapi'
import uniq from 'lodash/uniq'

import { apiError, apiSuccess } from '@/responses'
import { IEnv, openAPICreateUser, openAPIUpdateUser } from '@/types'
import { checkAuth, errorUserAlreadyExist, errorUserNotFound, getUser, storeUser } from '@/utils'

export class CreateUser extends OpenAPIRoute {
  static schema = {
    parameters: {
      Authorization: Header(Str, { required: false }),
    },
    requestBody: openAPICreateUser,
    summary: 'Create a new user',
    tags: ['User'],
  }

  async handle(request: Request, env: IEnv, ctx: ExecutionContext, data: Record<string, any>) {
    const { Authorization: authToken, body } = data

    const check = await checkAuth(env, authToken, 'admin')
    if (check.error) {
      return apiError(check.error, 401)
    }

    const { user_name: userName } = body

    const user = await getUser(env, userName)
    if (user) {
      return apiError(errorUserAlreadyExist, 400)
    }

    await storeUser(env, body)

    return apiSuccess()
  }
}

export class UpdateUser extends OpenAPIRoute {
  static schema = {
    parameters: {
      Authorization: Header(Str, { required: false }),
      user_name: Path(Str, {
        description: 'ID of the user to modify',
      }),
    },
    requestBody: openAPIUpdateUser,
    summary: 'Update the accessible accounts for a user',
    tags: ['User'],
  }

  async handle(request: Request, env: IEnv, ctx: ExecutionContext, data: Record<string, any>) {
    const { Authorization: authToken, user_name: userName, body } = data

    const check = await checkAuth(env, authToken, 'admin')
    if (check.error) {
      return apiError(check.error, 401)
    }

    const user = await getUser(env, userName)
    if (!user) {
      return apiError(errorUserNotFound, 400)
    }

    const accounts = uniq(user.access_accounts.concat(...body.access_accounts))

    user.access_accounts = accounts

    await storeUser(env, user)

    return apiSuccess()
  }
}

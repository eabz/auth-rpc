import { Header, OpenAPIRoute, Str } from '@cloudflare/itty-router-openapi'

import { apiSuccess } from '@/responses'
import { IEnv, openAPIUpdateUser } from '@/types'
import { checkAuth } from '@/utils'

export class UpdateUser extends OpenAPIRoute {
  static schema = {
    parameters: {
      Authorization: Header(Str, { required: false }),
    },
    requestBody: openAPIUpdateUser,
    summary: 'Create or update a user',
    tags: ['User'],
  }

  async handle(request: Request, env: IEnv, ctx: ExecutionContext, data: Record<string, any>) {
    const { Authorization: authToken, body } = data

    const error = await checkAuth(env, authToken, 'admin')
    if (error) {
      return error
    }

    const { user_name: userName } = body

    await env.USERS.put(userName, JSON.stringify(body))

    return apiSuccess()
  }
}
import { Header, OpenAPIRoute, Str } from '@cloudflare/itty-router-openapi'

import { rpcEndpoint } from '@/constants'
import { apiError, apiErrorJSON, apiSuccessJSON } from '@/responses'
import { IEnv, IRequest, openAPIRequest } from '@/types'
import { checkAuth, errorInternalAuthedWithoutUser } from '@/utils'

const relayRequest = async (env: IEnv, request: IRequest) => {
  const response = await fetch(rpcEndpoint, { body: JSON.stringify(request), method: 'POST' })

  const data: IRequest = await response.json()

  return apiSuccessJSON(data.result, request.id)
}

export class RpcRequest extends OpenAPIRoute {
  static schema = {
    parameters: {
      Authorization: Header(Str, { required: false }),
    },
    requestBody: openAPIRequest,
    summary: 'Endpoint to send any JSON RPC method',
    tags: ['RPC'],
  }

  async handle(request: Request, env: IEnv, ctx: ExecutionContext, data: Record<string, any>) {
    const { Authorization: authToken, body } = data

    const check = await checkAuth(env, authToken)
    if (check.error) {
      return apiError(check.error, 401)
    }

    if (check.user) {
      if (check.user.role === 'admin') {
        return relayRequest(env, body)
      } else {
        // TODO: do filtering
        return relayRequest(env, body)
      }
    } else {
      return apiErrorJSON(errorInternalAuthedWithoutUser, body.id)
    }
  }
}

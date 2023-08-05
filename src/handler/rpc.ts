import { Header, OpenAPIRoute, Str } from '@cloudflare/itty-router-openapi'

import { apiSuccessJSON } from '@/responses'
import { IEnv, IRequest, openAPIRequest } from '@/types'

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
    const payload: IRequest = await request.json()
    const { Authorization: authToken } = data

    console.log(authToken)
    return apiSuccessJSON({}, payload.id)
  }
}

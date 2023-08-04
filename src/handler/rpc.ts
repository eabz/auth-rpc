import { Num, OpenAPIRoute, Str } from '@cloudflare/itty-router-openapi'

import { apiSuccessJSON } from '@/responses'

const rpcRequestBody = {
  id: new Num(),
  jsonrpc: new Str(),
  method: new Str({ required: false }),
  params: [new Str({ required: false })],
}

export interface IRequest {
  id: number
  jsonrpc: string
  method?: string
  params?: any[]
}

export class RpcRequest extends OpenAPIRoute {
  static schema = {
    parameters: {},
    requestBody: rpcRequestBody,
    responses: {
      '200': {},
      '500': {},
    },
    summary: 'RPC Post request',
    tags: ['RPC'],
  }

  async handle(request: Request) {
    const payload: IRequest = await request.json()

    return apiSuccessJSON({}, payload.id)
  }
}

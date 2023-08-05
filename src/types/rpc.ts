import { Num, Str } from '@cloudflare/itty-router-openapi'

export const openAPIRequest = {
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
  result?: any
}

import { OpenAPIRouter } from '@cloudflare/itty-router-openapi'
import { createCors } from 'itty-cors'

import { apiError } from '@/responses'
import { IEnv } from '@/types'

import { RpcRequest } from './handler'

const { preflight, corsify } = createCors({
  methods: ['GET', 'POST'],
  origins: ['*'],
})

const router = OpenAPIRouter({
  schema: {
    info: {
      description: 'Authed RPC access.',
      title: 'Auth RPC',
      version: '1.0',
    },
  },
})

router.all('*', preflight)

router.post('/', RpcRequest)

router.all('*', () => new Response('Not Found.', { status: 404 }))

export default {
  fetch: async (request: Request, env: IEnv, ctx: ExecutionContext): Promise<Response> => {
    try {
      const res = await router.handle(request, env, ctx)

      return corsify(res)
    } catch (e) {
      return apiError('internal server error', 500)
    }
  },
}

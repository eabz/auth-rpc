import { Header, OpenAPIRoute, Str } from '@cloudflare/itty-router-openapi'

import { balanceOfFunctionSignature, rpcEndpoint, tokensAvailable } from '@/constants'
import { apiError, apiErrorJSON, apiSuccessJSON } from '@/responses'
import { IEnv, IRequest, IUserData, openAPIRequest } from '@/types'
import {
  checkAuth,
  errorAuthInvalidMethod,
  errorInternalAuthedWithoutUser,
  errorInvalidCallFunction,
  errorInvalidTokenForGetBalance,
  errorMisssingParams,
  errorUnableToAccessAccount,
} from '@/utils'

const handleCallRequest = async (user: IUserData, env: IEnv, request: IRequest): Promise<Response> => {
  if (!request || !request.params || request.params.length === 0) {
    return apiErrorJSON(errorMisssingParams('eth_call'), request.id)
  }

  const callInformation = request.params[0] as { data?: string; to?: string }

  if (!callInformation.to || !callInformation.data) {
    return apiErrorJSON(errorMisssingParams('eth_call'), request.id)
  }

  if (!tokensAvailable.includes(callInformation.to)) {
    return apiErrorJSON(errorInvalidTokenForGetBalance, request.id)
  }

  const functionSignature = callInformation.data.slice(10)
  if (functionSignature !== balanceOfFunctionSignature) {
    return apiErrorJSON(errorInvalidCallFunction, request.id)
  }

  const balanceAddress = '0x' + callInformation.data.slice(callInformation.data.length - 40)
  if (
    !user.access_accounts.includes(balanceAddress.toLowerCase()) &&
    balanceAddress.toLowerCase() !== user.user_name.toLowerCase()
  ) {
    return apiErrorJSON(errorUnableToAccessAccount, request.id)
  }

  return relayRequest(env, request)
}

const handleBalanceRequest = async (user: IUserData, env: IEnv, request: IRequest): Promise<Response> => {
  if (!request || !request.params || request.params.length === 0) {
    return apiErrorJSON(errorMisssingParams('eth_getBalance'), request.id)
  }

  const address = request.params[0].toLowerCase()
  if (!user.access_accounts.includes(address) && address !== user.user_name.toLowerCase()) {
    return apiErrorJSON(errorUnableToAccessAccount, request.id)
  }

  return relayRequest(env, request)
}

const handleSendTransactionRequest = async (user: IUserData, env: IEnv, request: IRequest): Promise<Response> => {
  if (!request || !request.params || request.params.length === 0) {
    return apiErrorJSON(errorMisssingParams('eth_sendTransaction'), request.id)
  }

  const txInformation = request.params[0] as { to?: string }

  if (!txInformation.to) {
    return apiErrorJSON(errorAuthInvalidMethod, request.id)
  }

  return relayRequest(env, request)
}

const relayRequest = async (env: IEnv, request: IRequest): Promise<Response> => {
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
        switch (body.method) {
          case 'eth_call':
            return handleCallRequest(check.user, env, body)
          case 'eth_getBalance':
            return handleBalanceRequest(check.user, env, body)
          case 'eth_sendTransaction':
            return handleSendTransactionRequest(check.user, env, body)
          default:
            return apiError(errorAuthInvalidMethod, 401)
        }
      }
    } else {
      return apiErrorJSON(errorInternalAuthedWithoutUser, body.id)
    }
  }
}

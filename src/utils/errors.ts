export const errorInvalidAuthUserNotFound = 'invalid auth: user not found'

export const errorInvalidAuthUserRoleMismatch = 'invalid auth: user role mismatch'

export const errorInvalidAuthUserTokenMismatch = 'invalid auth: user token mismatch'

export const errorInvalidToken = 'invalid auth: invalid token'

export const errorInternalAuthedWithoutUser = 'internal server error: authed but user information not found'

export const errorAuthInvalidMethod = 'invalid auth: not authorized to use that method'

export const errorUserAlreadyExist = 'cannot create new user: user already exists'

export const errorUserNotFound = 'user not found'

export const errorMisssingParams = (method: string) => 'invalid params for ' + method

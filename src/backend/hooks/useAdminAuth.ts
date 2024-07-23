import { onRequestAsyncHookHandler } from "fastify"
import { HTTPError } from "../utils/HTTPError"

export const useAdminAuth: onRequestAsyncHookHandler = async function (req, reply) {
 
  const str = req.headers["authorization"]?.split(" ")
  if (!str || str.length !== 2 || str[0] !== "Bearer") throw new HTTPError("Authorization required", 403) 
  
  const accessToken = str[1]
  if (!accessToken) throw new HTTPError("Wrong authorization token", 403) 
  
  try {
    const resp = await this.jwt.verifyAndDecode(accessToken)
    req.adminUser = { id: resp.id }
  } catch(e) {
    console.warn(e)
    throw new HTTPError("Wrong authorization token", 403) 
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    adminUser: { id: number }
  }
}

export {}
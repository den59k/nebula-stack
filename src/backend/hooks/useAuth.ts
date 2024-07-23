import { onRequestAsyncHookHandler } from "fastify"
import { HTTPError } from "../utils/HTTPError"

export const useAuth: onRequestAsyncHookHandler = async function (req, reply) {
  await useAuthSoft.call(this, req, reply)
  if (!req.currentUser) {
    throw new HTTPError("Authorization required", 403) 
  }
}

export const useAuthSoft: onRequestAsyncHookHandler = async function (req, reply) {
  const str = req.headers["authorization"]?.split(" ")
  if (!str || str.length !== 2 || str[0] !== "Bearer") return
  
  const accessToken = str[1]
  if (!accessToken) return
  
  try {
    const resp = await this.jwt.verifyAndDecode(accessToken)
    req.currentUser = { id: resp.id }
  } catch(e) {
    console.warn(e)
    throw new HTTPError("Wrong authorization token", 403) 
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    currentUser: { id: number }
  }
}

export {}
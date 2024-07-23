import { createHmac } from 'crypto'
import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

const secret = `kbHMj8RuuxagKyQf2xoPtPqSZDMR8GbT`

const plugin = () => {

  const header = { alg: "HS256", type: "JWT" }
  const headerBase64 = btoa(JSON.stringify(header))
  const expirationTime = 10 * 60 * 1000

  /** Encrypt and encode JWT */
  const encode = async (payload: any) => {
    const fullPayload = { exp: Date.now() + expirationTime, ...payload }
    const str = `${headerBase64}.${btoa(JSON.stringify(fullPayload))}`
    const sign = createHmac('sha256', secret).update(str).digest('base64url');

    return `${str}.${sign}`
  }

  /** Verify and decode JWT */
  const verifyAndDecode = async (jwt: string) => {
    if (jwt.length > 300) throw new Error("JWT has wrong format")
    const parts = jwt.split(".", 4)
    if (parts.length !== 3) throw new Error("JWT has wrong format")

    if (parts[0] !== headerBase64) throw new Error("JWT has wrong header")
    const payload = JSON.parse(atob(parts[1]))

    if (!payload.exp || Date.now() > payload.exp) throw new Error("JWT expired")
  
    const sign = createHmac('sha256', secret).update(`${parts[0]}.${parts[1]}`).digest('base64url');
    if (sign !== parts[2]) throw new Error("JWT has wrong signature")

    return payload
  }

  return { encode, verifyAndDecode }
}

export default fp(async (fastify: FastifyInstance) => {
  fastify.decorate("jwt", plugin())
})

declare module 'fastify' {
  interface FastifyInstance {
    jwt: ReturnType<typeof plugin>
  }
}
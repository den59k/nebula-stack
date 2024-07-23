import { FastifyInstance } from "fastify"
import { HTTPError } from "../../utils/HTTPError"
import { generateHash } from "../../utils/passwordHash"
import { uid } from "uid/secure"
import { useAdminAuth } from "../../hooks/useAdminAuth"
import { SchemaType, sc, schema, unfoldSchema } from 'compact-json-schema'

export default async (fastify: FastifyInstance) => {

  const generateRefreshToken = () => {
    return uid(60)
  }

  const loginSchema = schema({ login: "string", password: "string" })
  /** Login to app */
  fastify.post("/account/login", sc(loginSchema, "body"), async (req) => {

    const { login, password } = req.body as SchemaType<typeof loginSchema>

    const user = await fastify.prisma.adminUser.findUnique({ select: { id: true, password: true }, where: { login }})
    if (!user) throw new HTTPError({ login: { code: "auth.wrongLogin", message: "Wrong login" } })
  
    const hash = await generateHash(password)
    if (!hash.equals(user.password)) throw new HTTPError({ password: { code: "auth.wrongPassword", message: "Wrong password" } })

    const refreshToken = generateRefreshToken()
    const accessToken = await fastify.jwt.encode({ id: user.id })

    await fastify.prisma.adminUserSession.create({ 
      data: { adminUserId: user.id, ip: req.ips?.[0] ?? req.ip, refreshToken }
    })

    return { accessToken, refreshToken }
  })

  /** Get account data */
  fastify.get("/account", { onRequest: useAdminAuth }, async (req) => {
    const user = await fastify.prisma.adminUser.findUnique({ select: { id: true, login: true }, where: { id: req.adminUser.id }})
    return user
  })

  const updateTokenSchema = schema({ refreshToken: "string" })
  /** Update accessToken */
  fastify.post("/account/update-token", sc(updateTokenSchema, "body"), async (req) => {
    const { refreshToken } = req.body as SchemaType<typeof updateTokenSchema>
    const session = await fastify.prisma.adminUserSession.findUnique({ 
      where: { refreshToken } 
    })

    if (!session) throw new HTTPError("Wrong refreshToken", 403)
      
    const newRefreshToken = generateRefreshToken()
    await fastify.prisma.adminUserSession.update({
      where: { refreshToken },
      data: { refreshToken: newRefreshToken, updatedAt: new Date(), ip: req.ips?.[0] ?? req.ip }
    })
    const accessToken = await fastify.jwt.encode({ id: session.adminUserId })
    return { accessToken, refreshToken: newRefreshToken }
  })
  
  /** Logout user account */
  fastify.post("/account/logout", sc(updateTokenSchema, "body"), async (req) => {
    const { refreshToken } = req.body as SchemaType<typeof updateTokenSchema>
    await fastify.prisma.adminUserSession.deleteMany({
      where: { refreshToken } 
    })
  })
}
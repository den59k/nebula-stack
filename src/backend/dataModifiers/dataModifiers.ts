import { FastifyInstance } from "fastify";
import { generateHash } from "../utils/passwordHash";
import { uid } from "uid/secure";

export default async (fastify: FastifyInstance) => {

  fastify.nebula.registerModifier("hashAdminPassword", async (body, req) => {
    if (body.password) {
      const password = await generateHash(body.password)
      return { ...body, password }
    }
    return { ...body, password: undefined }
  })

  fastify.nebula.registerModifier("generateId", async (body, req) => {
    if (req.nebulaAction === "create") {
      Object.assign(body, { id: uid() })
    }
    return body
  })

  fastify.nebula.registerModifier("generateUuid", async (body, req) => {
    if (req.nebulaAction === "create") {
      Object.assign(body, { uuid: uid() })
    }
    return body
  })
}
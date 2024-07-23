import { FastifyInstance } from "fastify";
import { useAdminAuth } from "../../hooks/useAdminAuth";

export default async (fastify: FastifyInstance) => {

  fastify.addHook("onRequest", useAdminAuth)

  fastify.get("/nebula/hooks", async () => {
    return {
      hooks: fastify.nebula.getHooks(),
      modifiers: fastify.nebula.getModifiers(),
      effects: fastify.nebula.getEffects()
    }
  })

}
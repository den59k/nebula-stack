import { FastifyInstance, FastifyRequest } from "fastify";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { useAuth } from "../hooks/useAuth";

export default async (fastify: FastifyInstance) => {

  fastify.nebula.registerHook("useAdminAuth", async (req, reply) => {
    await useAdminAuth.call(fastify, req, reply)
  })

  fastify.nebula.registerHook("useAuth", async (req, reply) => {
    await useAuth.call(fastify, req, reply)
  })

}
import { SchemaType, sc, schema } from "compact-json-schema";
import { FastifyInstance } from "fastify";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { Prisma } from "@prisma/client";

export default async (fastify: FastifyInstance) => {

  fastify.addHook("onRequest", useAdminAuth)

  fastify.get("/sidebar", async (req) => {

    const views = fastify.views.getViews()

    return views
      .filter(item => item.showInAdmin === "show" || item.showInAdmin === "showEdit" || item.showInAdmin === "showEditDelete")
      .map(item => ({ id: item.id, name: item.name, systemTable: item.systemTable }))
  })

}
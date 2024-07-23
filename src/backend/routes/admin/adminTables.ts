import { FastifyInstance } from "fastify";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { Prisma } from "@prisma/client";
import { schema, sc, SchemaType } from "compact-json-schema";
import { HTTPError } from "../../utils/HTTPError";

export default async (fastify: FastifyInstance) => {

  fastify.addHook("onRequest", useAdminAuth)

  fastify.get("/tables-schema", () => {
    return {
      tables: Prisma.dmmf.datamodel.models,
      enums: Prisma.dmmf.datamodel.enums
    }
  })

  const paramsSchema = schema({ tableName: "string" })
  fastify.get("/tables/:tableName", sc(paramsSchema), async (req) => {
    const { tableName } = req.params as SchemaType<typeof paramsSchema>
    const schema = Prisma.dmmf.datamodel.models.find(item => item.name === tableName)

    const forms = fastify.forms.getForms().filter(item => item.systemTable === tableName)
    const views = fastify.views.getViews().filter(item => item.systemTable === tableName)
      
    return { ...schema, forms, views }
  })

  const getTableName = (tableName: string) => tableName[0].toLowerCase() + tableName.slice(1)
  
  fastify.get("/data/:tableName", sc(paramsSchema), async (req) => {
    const { tableName } = req.params as SchemaType<typeof paramsSchema>
    const view = fastify.views.getViews().find(item => item.systemTable === tableName)
    if (!view) throw new HTTPError(`View for table ${tableName} not found`)
      
    const select = Object.fromEntries((view.columns as any[]).map(item => [ item.fieldId, true ]))
    const data = await (fastify.prisma as any)[getTableName(tableName)].findMany({
      select
    })

    return { view, data }
  })

  fastify.get("/data/:tableName/form", sc(paramsSchema), async (req) => {
    const { tableName } = req.params as SchemaType<typeof paramsSchema>
    const form = fastify.forms.getForms().find(item => item.systemTable === tableName)
    if (!form) throw new HTTPError(`Form for table ${tableName} not found`)
    return form
  })

}
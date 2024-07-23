import { FastifyInstance } from "fastify";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { SchemaType, sc, schema } from "compact-json-schema";
import { uid } from "uid/secure";
import { HTTPError } from "../../utils/HTTPError";

export default async (fastify: FastifyInstance) => {

  fastify.addHook("onRequest", useAdminAuth)

  /** Get all views */
  fastify.get("/views", async (req) => {
    return fastify.views.getViews()
  })

  const params = schema({ viewId: "string" })
  /** Get view */
  fastify.get("/views/:viewId", sc(params), async (req) => {
    const { viewId } = req.params as SchemaType<typeof params>
    const view =  fastify.views.getView(viewId)
    if (!view) throw new HTTPError("View not found")
    return view
  })

  const viewSchema = schema({ systemTable: "string", name: "string", columns: "array", 
    showInAdmin: [ "none", "show", "showEdit", "showEditDelete" ], showInAdminForm: "string??" })
  /** Create new view */
  fastify.post("/views", sc(viewSchema, "body"), async (req) => {
    const { systemTable, name, columns, showInAdmin, showInAdminForm } = await req.body as SchemaType<typeof viewSchema>
    const view = fastify.views.createView({ id: uid(), systemTable, name, columns, showInAdmin, showInAdminForm })
    return { id: view.id }
  })

  /** Update view */
  fastify.post("/views/:viewId", sc(params, viewSchema), async (req) => {
    const { viewId } = req.params as SchemaType<typeof params>
    const view = fastify.views.getView(viewId)
    if (!view) throw new HTTPError("View not found")
    const { name, columns, showInAdmin, showInAdminForm } = await req.body as any
    Object.assign(view, { name, columns, showInAdmin, showInAdminForm })
    fastify.views.saveView(view)
  })

  /** Delete view */
  fastify.delete("/views/:viewId", sc(params), async (req) => {
    const { viewId } = req.params as SchemaType<typeof params>
    fastify.views.deleteView(viewId)
  })
}
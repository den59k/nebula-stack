import { FastifyInstance } from "fastify";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { schema, sc, SchemaType } from "compact-json-schema";
import { HTTPError } from "../../utils/HTTPError";
import { uid } from "uid/secure";

export default async (fastify: FastifyInstance) => {
  
  fastify.addHook("onRequest", useAdminAuth)

  /** Get all forms */
  fastify.get("/forms", async (req) => {
    return fastify.forms.getForms()
  })

  const params = schema({ formId: "string" })
  const formSchema = schema({ 
    systemTable: "string", name: "string", fields: "array", 
    hooks: { type: "array", items: "string" }, modifiers: { type: "array", items: "string" }, effects: { type: "array", items: "string" },
    endpoint: "string", endpointType: { type: "string", enum: [ "request", "create", "createEdit", "createEditDelete" ] },
  })
  /** Get form */
  fastify.get("/forms/:formId", sc(params), async (req) => {
    const { formId } = req.params as SchemaType<typeof params>
    const form =  fastify.forms.getForm(formId)
    if (!form) throw new HTTPError("Form not found")
    return form
  })

  /** Create new form */
  fastify.post("/forms", sc(formSchema, "body"), async (req) => {
    const { systemTable, name, fields, endpoint, endpointType, modifiers, hooks, effects } = req.body as SchemaType<typeof formSchema>
    const idField = fastify.forms.getIdField({ systemTable })?.name
    const form = fastify.forms.createForm({ id: uid(), systemTable, name, fields, endpoint, endpointType, modifiers, hooks, effects, idField })
    return { id: form.id }
  })

  /** Update form */
  fastify.post("/forms/:formId", sc(params, formSchema), async (req) => {
    const { formId } = req.params as SchemaType<typeof params>
    const form =  fastify.forms.getForm(formId)
    if (!form) throw new HTTPError("Form not found")
    fastify.forms.deleteFormEndpointUrl(form.endpoint)

    const { systemTable, name, fields, endpoint, endpointType, modifiers, hooks, effects } = req.body as SchemaType<typeof formSchema>
    const idField = fastify.forms.getIdField({ systemTable })?.name
    Object.assign(form, { systemTable, name, fields, endpoint, endpointType, modifiers, hooks, effects, idField })
    fastify.forms.saveForm(form)
  })

  /** Delete form */
  fastify.delete("/forms/:formId", sc(params), async (req) => {
    const { formId } = req.params as SchemaType<typeof params>
    fastify.forms.deleteForm(formId)
  })
}
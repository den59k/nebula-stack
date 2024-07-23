import { FastifyInstance, FastifyRequest } from "fastify";
import { HTTPError } from "../utils/HTTPError";
import { Prisma } from "@prisma/client";
import { traverseFormFields } from "../utils/traverse";

declare module 'fastify' {
  interface FastifyRequest {
    nebulaAction?: "create" | "edit" | "delete",
    itemId?: string | number
  }
}

export default async (fastify: FastifyInstance) => {
  
  fastify.decorateRequest("nebulaAction", null)
  fastify.decorateRequest("itemId", null)

  const getFormWithParam = (req: FastifyRequest) => {
    const url = req.url.slice("/api".length)

    const urlWithoutParam = url.slice(0, url.lastIndexOf("/"))
    const formWithParam = fastify.forms.getFormByUrl(urlWithoutParam)
    if (formWithParam) {
      const rawItemId = url.slice(url.lastIndexOf("/")+1)
      
      const idField = fastify.forms.getIdField(formWithParam)

      if (idField.type === 'Int') {
        req.itemId = parseInt(rawItemId)
        if (isNaN(req.itemId)) throw new HTTPError(`Validation Error. ItemId must be a number`)
      } else {
        req.itemId = rawItemId
      }
      return formWithParam
    }

    throw new HTTPError(`Route ${req.method}:${req.url} not found`, 404)
  }

  const getForm = (req: FastifyRequest) => {
    const url = req.url.slice("/api".length)
    
    const form = fastify.forms.getFormByUrl(url)
    if (form) return form

    return getFormWithParam(req)
  }

  fastify.get("/*", async (req) => {
    const form = getFormWithParam(req)
    const idField = fastify.forms.getIdField(form)
    
    if (form.endpointType !== "createEdit" && form.endpointType !== "createEditDelete") {
      throw new HTTPError(`Route ${req.method}:${req.url} not found`, 404)
    }

    const select: Record<string, any> = {}
    traverseFormFields(form.fields, (item: any) => {
      if (item.format === "password") return
      if (item.isCustom) {
        if (item.jsonField) {
          select[item.jsonField] = true
        }
        return
      }
      select[item.fieldId] = true
      if (item.format === "file" && item.fileField) {
        select[item.fileField] = { select: { src: true, previewSrc: true } }
      }
    })

    const item = await (fastify.prisma as any)[form.systemTable].findUniqueOrThrow({
      select,
      where: { [idField.name]: req.itemId! }
    })

    traverseFormFields(form.fields, (field: any) => {
      if (field.isCustom && field.jsonField && field.jsonField in item) {
        item[field.fieldId] = item[field.jsonField][field.fieldId]
      }
    })

    return item
  })

  fastify.post("/*", async (req, reply) => {
    const body = req.body as any
    const form = getForm(req)
    const itemId = req.itemId!
    
    req.nebulaAction = itemId === null? "create": "edit"
    await fastify.nebula.applyHooks(form.hooks, req, reply)

    const _body: Record<string, any> = {}
    traverseFormFields(form.fields, (item: any) => {
      if (!item.fieldId) return

      if (item.jsonField) {
        if (!_body[item.jsonField]) {
          _body[item.jsonField] = {}
        }
        if (item.fieldId in body) {
          _body[item.jsonField][item.fieldId] = body[item.fieldId]
        }
        return
      }

      if (item.fieldId in body) {
        _body[item.fieldId] = body[item.fieldId]
      }
      if (item.fileField && item.fileField in body) {
        if (item.format === "files-group") {
          _body[item.fieldId] = body[item.fileField].map((item: any) => item.id)
        } else {
          _body[item.fieldId] = body[item.fileField]?.id ?? null
        }
      }
    })

    const newBody = await fastify.nebula.applyModifiers(form.modifiers, _body, req, reply)

    const idField = fastify.forms.getIdField(form)

    if (itemId !== null) {
      const resp = await (fastify.prisma as any)[form.systemTable].update({
        data: newBody,
        where: { [idField.name]: itemId }
      })

      await fastify.nebula.applyEffects(form.effects, resp, req)

      return { id: resp.id }
    } else {
      const resp = await (fastify.prisma as any)[form.systemTable].create({
        data: newBody
      })

      await fastify.nebula.applyEffects(form.effects, resp, req)

      return { id: resp.id, uuid: resp.uuid }
    }
  })

  fastify.delete("/*", async (req, reply) => {
    const body = req.body as any
    const form = getFormWithParam(req)
    const itemId = req.itemId!

    req.nebulaAction = "delete"
    await fastify.nebula.applyHooks(form.hooks, req, reply)

    const idField = fastify.forms.getIdField(form)
    await (fastify.prisma as any)[form.systemTable].delete({
      where: { [idField.name]: itemId }
    })
    return { status: "ok" }
  })

}
import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { join } from 'path'
import fs from 'fs'
import { Prisma } from '@prisma/client'
import { HTTPError } from '../utils/HTTPError'

export type Form = {
  id: string,
  name: string,
  systemTable: string,
  fields: any[],
  hooks: string[],
  modifiers: string[],
  effects: string[],
  endpoint: string,
  endpointType: "request" | "create" | "createEdit" | "createEditDelete",
  idField?: string
}

const plugin = () => {
  
  const forms = new Map<string, Form>()
  const formEndpoints = new Map<string, Form>()
  const formsFolder = join(process.cwd(), "static/forms")

  const createForm = (form: Form) => {
    forms.set(form.id, form)
    saveForm(form)
    return form
  }

  const saveForm = (form: Form) => {
    fs.writeFileSync(join(formsFolder, `${form.id}.json`), JSON.stringify(form, null, 2))
    formEndpoints.set(form.endpoint, form)
  }

  const getForms = () => {
    return Array.from(forms.values())
  }

  const getForm = (id: string) => {
    return forms.get(id)
  }

  const getFormByUrl = (url: string) => {
    return formEndpoints.get(url)
  }

  const deleteFormEndpointUrl = (url: string) => {
    formEndpoints.delete(url)
  }

  const deleteForm = (id: string) => {
    const form = forms.get(id)
    if (!form) return
    forms.delete(id)
    formEndpoints.delete(form.endpoint)
    if (fs.existsSync(join(formsFolder, `${form.id}.json`))) {
      fs.unlinkSync(join(formsFolder, `${form.id}.json`))
    }
  }

  const getIdField = (form: Pick<Form, "idField" | "systemTable">) => {
    const systemTable = Prisma.dmmf.datamodel.models.find(item => item.name === form.systemTable)
    if (form.idField) {
      const idField =  systemTable?.fields.find(item => item.name === form.idField)
      if (!idField) throw new HTTPError(`Error occurred. Contact with administrator. Code: 1B012-b`)
      return idField
    }

    const idField = systemTable?.fields.find(item => item.isId)
    if (!idField) throw new HTTPError(`Error occurred. Contact with administrator. Code: 1B012-c`)
    return idField
  }
  
  const _init = async () => {
    if (!fs.existsSync(formsFolder)) {
      await fs.promises.mkdir(formsFolder, { recursive: true })
      return
    }
    const files = await fs.promises.readdir(formsFolder)
    for (let file of files) {
      if (!file.endsWith(".json")) continue
      try {
        const data = JSON.parse(await fs.promises.readFile(join(formsFolder, file), "utf-8"))
        forms.set(data.id, data)
        formEndpoints.set(data.endpoint, data)
      } catch(e) {
        console.warn(`Unable to parse file /fs/views/${file}`)
      }
    }
  }

  return { getForm, getForms, createForm, deleteForm, saveForm, getIdField, _init, getFormByUrl, deleteFormEndpointUrl }
}

export default fp(async (fastify: FastifyInstance) => {
  fastify.decorate("forms", plugin())
  await fastify.forms._init()
})

declare module 'fastify' {
  interface FastifyInstance {
    forms: ReturnType<typeof plugin>
  }
}
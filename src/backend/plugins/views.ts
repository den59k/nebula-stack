import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import fs from 'fs'
import { join } from 'path'

type View = {
  id: string,
  name: string,
  systemTable: string,
  columns: any[],
  showInAdmin: "none" | "show" | "showEdit" | "showEditDelete",
  showInAdminForm?: string | null
}

const plugin = () => {

  const views = new Map<string, View>()
  const viewsFolder = join(process.cwd(), "static/views")

  const createView = (view: View) => {
    views.set(view.id, view)
    saveView(view)
    return view
  }

  const saveView = (view: View) => {
    fs.writeFileSync(join(viewsFolder, `${view.id}.json`), JSON.stringify(view, null, 2))
  }

  const getViews = () => {
    return Array.from(views.values())
  }

  const getView = (id: string) => {
    return views.get(id)
  }

  const deleteView = (id: string) => {
    views.delete(id)
    if (fs.existsSync(join(viewsFolder, `${id}.json`))) {
      fs.unlinkSync(join(viewsFolder, `${id}.json`))
    }
  }

  const _init = async () => {
    if (!fs.existsSync(viewsFolder)) {
      await fs.promises.mkdir(viewsFolder, { recursive: true })
      return
    }
    const files = await fs.promises.readdir(viewsFolder)
    for (let file of files) {
      if (!file.endsWith(".json")) continue
      try {
        const data = JSON.parse(await fs.promises.readFile(join(viewsFolder, file), "utf-8"))
        views.set(data.id, data)
      } catch(e) {
        console.warn(`Unable to parse file /fs/views/${file}`)
      }
    }
  }

  return { getView, createView, getViews, deleteView, saveView, _init }
}

export default fp(async (fastify: FastifyInstance) => {
  fastify.decorate("views", plugin())
  await fastify.views._init()
})

declare module 'fastify' {
  interface FastifyInstance {
    views: ReturnType<typeof plugin>
  }
}
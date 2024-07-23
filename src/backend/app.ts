import 'dotenv/config'
import fastify, { FastifyServerOptions } from 'fastify'
import fastifyStatic from '@fastify/static'
import fastifyMultipart from '@fastify/multipart'
import { join } from 'path'

const plugins = import.meta.glob<any>('./plugins/**/*.ts', { eager: true })
const routes = import.meta.glob<any>('./routes/**/*.ts', { eager: true })

export const createApp = (opts?: FastifyServerOptions) => {

  const app = fastify(opts)
  for (let plugin of Object.values(plugins)) {
    if (typeof plugin.default !== "function") continue
    app.register(plugin)
  }
  app.register(fastifyMultipart, { limits: { fileSize: 1024 * 1024 * 5 }})

  const routePrefix = "/api"
  for (let [ key, route ] of Object.entries(routes)) {
    if (typeof route.default !== "function") continue
    const path = key.slice("./routes/".length).split("/")
    const prefix = route.prefix ?? [ routePrefix, ...path.slice(0, -1) ].join("/")
    app.register(route, { prefix })
  }

  app.register(fastifyStatic, { prefix: "/uploads/", root: join(process.cwd(), "uploads") })

  if (import.meta.env.MODE === "production") {

    app.register(fastifyStatic, { prefix: "/admin", root: join(process.cwd(), "dist/cms"), decorateReply: false })
    // app.register(fastifyStatic, { prefix: "/client-assets/", root: join(process.cwd(), "dist/client/client-assets"), decorateReply: false })
    app.setNotFoundHandler(async (req, reply) => {
      if (req.url.startsWith("/api")) return reply.code(404).send({ error: `Route ${req.method}:${req.url} not found` })
      return reply.sendFile("index.html", "./dist/cms")
    })
  }

  return app
}
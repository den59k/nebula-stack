import { createServer, loadEnv } from 'vite'
import { viteNodeHmrPlugin, createHotContext, handleMessage } from 'vite-node/hmr'
import { installSourcemapsSupport } from 'vite-node/source-map'
import { ViteNodeServer } from 'vite-node/server'
import { ViteNodeRunner } from 'vite-node/client'
import fs from 'fs'
import { join, resolve } from 'path'
import { useEventListener } from './useEventListener.js'
import { exec } from 'child_process'
import { lookup } from './mime.js'

let time = Date.now()

const watchIgnore = [ "**/node_modules/**", "**/.git/**", "**/dist/**", "**/temp/**", "**/uploads/**", "**/codebase/**" ]

const startMain = async (onCreate) => {
  const server = await createServer({
    configFile: "vite.backend.config.ts",
    optimizeDeps: { noDiscovery: true, include: [] },
    mode: "development",
    server: {
      hmr: true,
      watch: {
        ignored: watchIgnore
      }
    },
    plugins: [
      viteNodeHmrPlugin()
    ]
  })

  await server.pluginContainer.buildStart({})
  installSourcemapsSupport({
    getSourceMap: source => node.getSourceMap(source),
  })

  const node = new ViteNodeServer(server)
  const runner = new ViteNodeRunner({
    root: server.config.root,
    base: server.config.base,
    fetchModule(id) {
      return node.fetchModule(id)
    },
    resolveId(id, importer) {
      return node.resolveId(id, importer)
    },
    createHotContext(runner, url) {
      return createHotContext(runner, server.emitter, ['./src/backend/app.ts'], url)
    },
  })
  const { createApp } = await runner.executeFile('./src/backend/app.ts')

  let app = createApp({ forceCloseConnections: true })

  const reloadApp = async () => {
    time = Date.now()
    await app.close()
    // const path = runner.moduleCache.normalizePath(`${process.cwd()}/src/backend/app.ts`)

    const { createApp } = runner.moduleCache.get(`${process.cwd()}/src/backend/app.ts`).exports
    app = createApp({ forceCloseConnections: true })
    onCreate(app, true)
  }

  server.emitter?.on('message', async (payload) => {
    await handleMessage(runner, server.emitter, ['./src/backend/app.ts'], payload)
    if (payload.type === "full-reload") {
      await reloadApp()
    }
  })

  onCreate(app)
  
  const events = []
  const fullReload = async () => {
    time = Date.now()
    await app.close()
    await server.close()
    events.forEach(item => item())
    startMain(onCreate)
  }

  events.push(useEventListener([ "r", "к" ], fullReload))
  events.push(useEventListener([ "q", "й" ], async () => {
    await app.close()
    process.exit()
  }))
}

const init = async () => {
  const env = loadEnv("development", process.cwd(), 'VITE')
  const vite = await createServer({
    configFile: "vite.cms.config.ts",
    root: process.cwd(),
    server: {
      middlewareMode: true,
      cors: false,
      watch: {
        ignored: watchIgnore
      }
    }
  })
  Object.assign(vite.config.env, env)

  // const viteClient = await createServer({
  //   configFile: "vite.client.config.ts",
  // })
  // await viteClient.listen()
  
  const NULL_BYTE_PLACEHOLDER = `/@id/__x00__`;
  const reg = /\.(m?js|ts|vue|sass|scss|css)(\?.+)?$/
  const ignoreReg = /^\/assets\/.+\.(js|css)$/

  const onRequestHook = async (req, reply) => {
    if (ignoreReg.test(req.url) || req.url.startsWith("/view-assets/")) return
    if (req.url.startsWith("/src") && req.headers["accept"] !== "*/*") {
      return reply.headers({ "content-type": lookup(req.url) }).send(fs.createReadStream(join(process.cwd(), req.url)))
    }
    if (req.url.startsWith("/src/") || req.url.startsWith("/@") || reg.test(req.url)) {
      try {
        const url = req.url.replace(NULL_BYTE_PLACEHOLDER, '\0')
        const result = await vite.transformRequest(url)

        return reply
          .headers({ etag: result.etag, "content-type": "text/javascript" })
          .send(result.code)
      } catch(e) {
        console.error(e)
        throw e
      }
    }
    // vite.middlewares(req, reply, done)
  }

  let address = ""
  startMain(async (app, isReload) => {
    app.addHook("onRequest", onRequestHook)
    
    app.setNotFoundHandler(async (req, reply) => {
      if (req.originalUrl.startsWith("/api")) return reply.code(404).send({ error: `Route ${req.method}:${req.url} not found` })

      let template = fs.readFileSync(resolve(process.cwd(), "src/cms/index.html"), "utf-8")
      template = template.replaceAll("./", '/src/cms/')
      template = await vite.transformIndexHtml(req.url, template, req.originalUrl)

      return reply.headers({ "content-type": "text/html" }).send(template)
    })
  
    const port = parseInt(process.env.PORT ?? "9000")
    address = await app.listen({ port, host: process.env.HOST ?? "127.0.0.1" })
    const launchTime = Math.floor((Date.now() - time) / 100) / 10
    console.info(`Server launched on ${address}. ${isReload? "Reload": "Launch"} time: ${launchTime}s`)
  })
  
  useEventListener([ "o", "щ" ], () => {
    const start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open')
    exec(`${start} ${address}`)
  })

  useEventListener([ "c", "с" ], () => {
    viteClient.openBrowser()
  })
}

init()
import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { extname, join } from 'path'
import fs from 'fs'
import os from 'os'

const createFilesPlugin = () => {
  
  const folders = {
    uploads: join(process.cwd(), "uploads"),
    temp: os.tmpdir(),
    static: join(process.cwd(), "static")
  }

  fs.mkdirSync(folders.uploads, { recursive: true })
  fs.mkdirSync(folders.static, { recursive: true })

  const getPath = (path: string = "/", type: "temp" | "uploads" | 'static' = "uploads") => {
    return join(folders[type], path)
  }

  const getExtension = (filename: string) => {
    return extname(filename).toLowerCase()
  }

  const writeFile = async (fileName: string, data: Buffer | string) => {
    await fs.promises.writeFile(folders.uploads + "/" + fileName, data)
    return "/uploads/"+fileName
  }

  const mkdirSync = (path: string) => {
    fs.mkdirSync(getPath(path), { recursive: true })
  }

  return {
    getExtension,
    writeFile,
    getPath,
    mkdirSync
  }
}

export default fp(async (fastify: FastifyInstance) => {
  fastify.decorate("files", createFilesPlugin())
})

declare module 'fastify' {
  interface FastifyInstance {
    files: ReturnType<typeof createFilesPlugin>
  }
}
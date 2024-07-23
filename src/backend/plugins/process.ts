import { FastifyInstance } from "fastify"
import fp from 'fastify-plugin'
import { uid } from "uid"

type Process = {
  status: "success" | "error" | "process",
  data: any
}

const plugin = (_fastify: FastifyInstance) => {
  const processes = new Map<string, Process>()
  const startProcess = (callback: (onProgress: (data: any) => void) => Promise<any>) => {
    const processId = uid(5)
    const process: Process = { status: "process", data: null }
    const onProgress = (data: any) => {
      process.data = data
    }
    processes.set(processId, process)

    callback(onProgress)
      .then((data) => {
        if (data !== undefined) {
          process.data = data
        }
        process.status = "success"
      })
      .catch(() => {
        process.status = "error"
      })
      .finally(() => {
        setTimeout(() => processes.delete(processId), 10000)
      })

    return processId
  }

  const getProcess = (processId: string) => {
    return processes.get(processId)
  }

  return {
    startProcess,
    getProcess
  }
}

export default fp(async (fastify: FastifyInstance) => {
  fastify.decorate("process", plugin(fastify))
})

declare module 'fastify' {
  interface FastifyInstance {
    process: ReturnType<typeof plugin>
  }
}
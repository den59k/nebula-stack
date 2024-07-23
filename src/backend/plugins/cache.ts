import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

const plugin = (fastify: FastifyInstance) => {

  const cache = new Map<string, any[]> ()

  const set = (key: string, state: any) => {
    cache.set(key, state)
  }

  const get = (key: string) => {
    return cache.get(key)
  }

  const _delete = (key: string) => {
    cache.delete(key)
  }
  
  return {
    set,
    get,
    delete: _delete
  }
}

export default fp(async (fastify: FastifyInstance) => {
  fastify.decorate("cache", plugin(fastify))
})

declare module 'fastify' {
  interface FastifyInstance {
    cache: ReturnType<typeof plugin>
  }
}
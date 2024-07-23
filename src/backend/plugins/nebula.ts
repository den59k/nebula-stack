import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import dataHooks from '../dataHooks/dataHooks'
import dataModifiers from '../dataModifiers/dataModifiers'

type Hook = { name: string, onRequest: (req: FastifyRequest, reply: FastifyReply) => Promise<void> | void }
type Modifier = { name: string, onRequest: (body: any, req: FastifyRequest, reply: FastifyReply) => Promise<any> | any }
type Effect = { name: string, onRequest: (object: any, req: FastifyRequest) => Promise<void> | void }

const plugin = () => {
  
  const hooks = new Map<string, Hook>()
  const modifiers = new Map<string, Modifier>()
  const effects = new Map<string, Effect>()

  return {
    registerHook: (name: string, onRequest: Hook["onRequest"]) => {
      hooks.set(name, { name, onRequest })
    },
    registerModifier: (name: string, onRequest: Modifier["onRequest"]) => {
      modifiers.set(name, { name, onRequest })
    },
    registerEffect: (name: string, onRequest: Effect["onRequest"]) => {
      effects.set(name, { name, onRequest })
    },
    getHooks: () => Array.from(hooks.values()),
    getModifiers: () => Array.from(modifiers.values()),
    getEffects: () => Array.from(effects.values()),

    applyHooks: async (hooksChain: string[], req: FastifyRequest, reply: FastifyReply) => {
      for (let hookId of hooksChain) {
        const hook = hooks.get(hookId)
        if (!hook) {
          console.warn(`Hook ${hookId} not found`)
          continue
        }
        await hook.onRequest(req, reply)
      }
    },
    applyModifiers: async (modifiersChain: string[], body: any, req: FastifyRequest, reply: FastifyReply) => {
      let _body = body
      for (let modifierId of modifiersChain) {
        const modifier = modifiers.get(modifierId)
        if (!modifier) {
          console.warn(`Modifier ${modifierId} not found`)
          continue
        }
        _body = await modifier.onRequest(_body, req, reply)
      }
      return _body
    },
    applyEffects: async (effectsChain: string[], object: any, req: FastifyRequest) => {
      for (let effectId of effectsChain) {
        const effect = effects.get(effectId)
        if (!effect) {
          console.warn(`Effect ${effectId} not found`)
          continue
        }
        await effect.onRequest(object, req)
      }
    }
  }
}

export default fp(async (fastify: FastifyInstance) => {
  fastify.decorate("nebula", plugin())

  dataHooks(fastify)
  dataModifiers(fastify)
})

declare module 'fastify' {
  interface FastifyInstance {
    nebula: ReturnType<typeof plugin>
  }
}
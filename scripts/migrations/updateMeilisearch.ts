import { PrismaClient } from "@prisma/client"
import { Meilisearch } from "meilisearch"
import { translit } from "../../src/backend/utils/translit"

export const updateMeilisearch = async () => {

  const prisma = new PrismaClient()
  await prisma.$connect()

  const client = new Meilisearch({
    host: process.env.MEILISEARCH_URL ?? "http://127.0.0.1:7700",
    apiKey: process.env.MEILISEARCH_MASTER_KEY
  })

  const carModels = await prisma.carModel.findMany({
    include: { brand: true }
  })

  await client.index("carModels").delete()
  await client.index("carModels").addDocuments(carModels.map(model => ({
    id: model.id, name: model.name, brand: model.brand.name,
    brandTranslit: translit(model.brand.name), nameTranslit: translit(model.name)
  })))
  console.info(`Sync ${carModels.length} car models`)

  const offers = await prisma.offer.findMany({
    include: { model: { include: { brand: true } } }
  })

  await client.index("offers").delete()
  await client.index("offers").addDocuments(offers.map(obj => ({
    id: obj.id.toString(), description: obj.description, location: obj.location, brand: obj.model?.brand.name, model: obj.model?.name
  })))
  console.info(`Sync ${offers.length} offers`)
}
import { FastifyInstance } from "fastify";

/** Fill imageField and mutate source object */
export const fillImages = async <T extends object>(fastify: FastifyInstance, object: T | T[], idField: keyof T, imageField: string, count = 1) => {
  const imageIds: string[] = []

  let arr = Array.isArray(object)? object: [ object ]
  for (let item of arr) {
    if (Array.isArray(item[idField])) {
      if (count === 1) {
        imageIds.push((item[idField] as string[])[0])
      } else {
        imageIds.push(...(item[idField] as string[]))
      }
    } else {
      imageIds.push(item[idField] as string)
    }
  }
  if (arr.length === 0) return object

  const images = await fastify.prisma.file.findMany({
    select: { id: true, src: true, previewSrc: true },
    where: { id: { in: imageIds } }
  })
  const imagesMap = new Map<string, typeof images[number]>(images.map(item => [ item.id, item ]))

  for (let item of arr) {
    if (Array.isArray(item[idField])) {
      Object.assign(item, { [imageField]: (item[idField] as string[]).map(imageId => imagesMap.get(imageId)) })
    } else {
      Object.assign(item, { [imageField]: imagesMap.get(item[idField] as string) })
    }
  }
  
  return object
}
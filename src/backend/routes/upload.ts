import { FastifyInstance } from "fastify";
import { HTTPError } from "../utils/HTTPError";
import { uid } from 'uid/secure'

export default async (fastify: FastifyInstance) => {
  
  fastify.post("/upload", async (req) => {
    const file = await req.file()
    if (!file) throw new HTTPError("File field not found", 400)

    const fileBuffer = await file.toBuffer()

    const extension = fastify.files.getExtension(file.filename)

    const fileId = uid(20)
    const src = await fastify.files.writeFile(`${fileId}${extension}`, fileBuffer)
    await fastify.prisma.file.create({
      data: { id: fileId, src, size: fileBuffer.byteLength }
    })

    return { id: fileId, src }
  })

}
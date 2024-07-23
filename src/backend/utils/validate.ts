import { FastifyInstance } from "fastify"
import { HTTPError } from "./HTTPError"

export const validateToken = async (fastify: FastifyInstance, token?: string) => {

  if (!token) throw new HTTPError("Registration token required")
  
  const userRequest = await fastify.prisma.userCandidate.findFirst({ 
    select: { id: true, data: true, email: true, userId: true },
    where: { registrationToken: token }
  })
  if (!userRequest) throw new HTTPError("Token is not valid")
  if (userRequest.userId !== null) throw new HTTPError("Token already used")
  return userRequest
}

export const validatePassword = (password: string) => {
  if (password.trim().length < 8) {
    throw new HTTPError({ password: { code: "passwordTooSmall", message: "Пароль должен содержать не менее 8 символов" } })
  }
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isEmail(str: string) {
  return emailRegex.test(str)
}

export const validateEmail = async (fastify: FastifyInstance, email: string) => {
  if (!isEmail(email)) {
    throw new HTTPError({ email: { code: "auth.invalidEmail", message: "Введен некорректный e-mail"} }, 403)
  }
  
  const exist = await fastify.prisma.user.findFirst({ select: { id: true }, where: { email } })
  if (exist) {
    throw new HTTPError({ email: { code: "alreadyExists", message: "Такой e-mail уже зарегистрирован"}}, 409)
  } 
}


import crypto from 'crypto'
import { uid } from 'uid/secure'
import { promisify } from 'util'

export const generateHash = (pass: string): Promise<Buffer> => {
  return promisify(crypto.scrypt)(pass, "nebula", 32) as Promise<Buffer>
}

export const generateRefreshToken = () => {
  return uid(60)
}
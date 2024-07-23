import { XhrOptions, sendXHR } from "./request"

export const utilsApi = {
  uploadFile: (file: File | Blob, options?: XhrOptions) => {
    const formData = new FormData()
    formData.append("file", file)
    return sendXHR("/api/upload", formData, options)
  }
}
import { setUseFormErrorHandler } from "vuesix"

let jwt = ""

export class HTTPError extends Error {
  body: any
  statusCode: number

  constructor(body: any, statusCode: number = 401) {
    super()
    this.body = body
    this.statusCode = statusCode
  }
}

setUseFormErrorHandler((e, errors) => {
  if (e instanceof HTTPError && typeof e.body?.error === "object") {
    for (let [key, error] of Object.entries(e.body.error)) {
      if (typeof error === "string") {
        (errors as any)[key] = error as string
      } else if (typeof error === "object" && error) {
        (errors as any)[key] = error
      }
    }
  }
})

export const setJwt = (value: string) => {
  jwt = value
}

type Options = Partial<{
  method: "GET" | "POST" | "DELETE" | "PUT",
  responseContentType: "json" | "blob"
}>

export const request = async <T = any>(url: string, body?: any, options: Options = {}) => {

  const headers: { [key: string]: string} = {}
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }
  if (jwt) {
    headers["Authorization"] = "Bearer "+jwt
  }

  const resp = await fetch(url, {
    method: options.method || (body? "POST": "GET"),
    body: body? (body instanceof FormData? body: JSON.stringify(body)): null,
    headers
  })

  let response = null as T
  if (resp.headers.get("content-type")?.startsWith("application/json")) {
    response = await resp.json() as T
  }
  if (resp.headers.get("content-type")?.startsWith("text/plain")) {
    response = await resp.text() as T
  }

  if (resp.status >= 400) {
    throw new HTTPError(response, resp.status)
  }

  if (options.responseContentType === "blob"){
    response = await resp.blob() as T
  }

  return response as T
}

export type XhrOptions = { 
  method?: string,
  onProgress?: (percent: number) => void,
  responseType?: XMLHttpRequestResponseType,
  fileSize?: number,
  cancelationToken?: CancelationToken
}

export const sendXHR = (url: string, body: FormData, { method, onProgress, cancelationToken }: XhrOptions = {}) => {
  const xhr = new XMLHttpRequest()
  xhr.open(method || "POST", url)

  if (jwt) {
    xhr.setRequestHeader("Authorization", "Bearer "+jwt)
  }

  xhr.responseType = "json"
  if (onProgress) {
    xhr.upload.onprogress = (ev) => {
      onProgress(Math.trunc(ev.loaded/ev.total*100))
    }
  }

  if (cancelationToken) {
    cancelationToken.cancel = () => xhr.abort()
  }

  xhr.send(body)

  return new Promise<any>((res, rej) => {
    xhr.onload = () => {
      if (onProgress) {
        onProgress(100)
      }
      if (xhr.status >= 400) {
        rej(new HTTPError(xhr.response, xhr.status))
        return
      }
      res(xhr.response)
    }
    xhr.onerror = () => {
      rej(new Error("HTTP Error occurred"))
    } 
  })

}

export class CancelationToken {
  cancel: () => void = () => {}
}

export const downloadXHR = async (
  url: string,
  {method, onProgress, cancelationToken, responseType, fileSize }: XhrOptions = {}
): Promise<any> => {
  const xhr = new XMLHttpRequest();
  xhr.open(method ?? "GET", url);
  if (onProgress) {
    xhr.onprogress = ev => {
      const size = ev.total === 0 ? fileSize ?? 0 : ev.total;
      if (size === 0) return;
      onProgress(Math.trunc((ev.loaded / size) * 100));
    };
  }
  if (cancelationToken) {
    cancelationToken.cancel = () => {
      xhr.abort();
    };
  }

  if (jwt) {
    xhr.setRequestHeader("Authorization", "Bearer "+jwt)
  }
  xhr.send();
  xhr.responseType = responseType ?? "blob";

  return new Promise<any>((res, rej) => {
    xhr.onload = () => {
      if (onProgress) {
        onProgress(100)
      }
      if (xhr.status >= 400) {
        rej(new HTTPError(xhr.response, xhr.status))
        return
      }
      res(xhr.response)
    }
    xhr.onerror = () => {
      rej()
    } 
  })
};
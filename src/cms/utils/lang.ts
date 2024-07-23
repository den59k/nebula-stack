
export const capitalize = (text: string) => {
  return text[0].toUpperCase() + text.slice(1)
}

export const spaceCamelCase = (str: string) => {
  return capitalize(str.replace(/([A-Z])/g, " $1").trimStart())
}

export const camelCaseToKebab = (str: string) => {
  const resp = str.replace(/([A-Z])/g, "-$1").toLowerCase()
  if (resp.startsWith("-")) return resp.slice(1)
  return resp
}
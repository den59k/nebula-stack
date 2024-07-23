
/** Parse string value */
export const parseIntItemId = (value: string | string[]) => {
  if (value === "new" || typeof value !== "string") return null
  const id = parseInt(value)
  if (isNaN(id)) return null
  return id
}

export const parseItemId = (value: string | string[]) => {
  if (value === "new" || typeof value !== "string") return null
  return value as string
}
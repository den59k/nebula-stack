import { request } from "./request";

export type TableSchema = {
  name: string,
  fields: Field[],
  isGenerated: boolean
}

export type Enum = {
  name: string,
  values: { name: string }[]
}

export type TableSchemaDto = {
  tables: TableSchema[],
  enums: Enum[]
}

export type Field = {
  name: string,
  kind: string,
  type: string,
  default: { name: string } | null
}

export const tablesApi = {
  getTablesSchema: () => request<TableSchemaDto>("/api/admin/tables-schema"),
  getSchema: (tableId: string) => request<TableSchema>(`/api/admin/tables/${tableId}`),

}
import { request } from "./request";

export type View = {
  id: string,
  name: string,
  systemTable: string
}

export const viewsApi = {
  getAll: () => request<View[]>("/api/admin/views"),
  getView: (viewId: string) => request(`/api/admin/views/${viewId}`),
  createView: (values: any) => request("/api/admin/views", values),
  updateView: (viewId: string, values: any) => request(`/api/admin/views/${viewId}`, values),
  deleteView: (viewId: string) => request(`/api/admin/views/${viewId}`, {}, { method: "DELETE" })
}
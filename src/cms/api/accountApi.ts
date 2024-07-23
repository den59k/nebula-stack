import { request } from "./request"

type Credentials = { login: string, password: string }

export const accountApi = {
  login: (values: Credentials) => request("/api/admin/account/login", values),
  getUserInfo: () => request("/api/admin/account"),
  updateToken: (refreshToken: string) => request("/api/admin/account/update-token", { refreshToken }),
  logout: (refreshToken: string) => request("/api/admin/account/logout", { refreshToken }),

  getSidebarItems: () => request("/api/admin/sidebar"),
  getTableForm: (tableName: string) => request(`/api/admin/data/${tableName}/form`),
  getTableData: (tableName: string) => request(`/api/admin/data/${tableName}`),
}
import { request } from "./request";

export const nebulaApi = {
  getHooks: () => request("/api/admin/nebula/hooks"),
}
import { defineStore } from "pinia";
import { HTTPError, setJwt } from "../api/request";
import { ref } from "vue";
import { accountApi } from "../api/accountApi";
import { useRouter } from "vue-router";

export const useAccountStore = defineStore('account', () => {

  const status = ref<"init" | "authorized" | "not-authorized">("init")
  const currentUser = ref<{ id: number, login: string }>()
  const sidebarInfo = ref<{ name: string, systemName: string }[]>()

  const requestUserInfo = async () => {
    currentUser.value = await accountApi.getUserInfo()
  }

  let updateAccessTokenTimeout: ReturnType<typeof setTimeout> | null = null
  const updateAccessTokenTimer = (accessToken: string) => {
    const payload = JSON.parse(atob(accessToken.split(".")[1]))
    if (updateAccessTokenTimeout !== null) clearTimeout(updateAccessTokenTimeout)

    const nextUpdate = Math.max(payload.exp - Date.now() - 10000, 0)
    console.info(`Set update token timer for ${Math.trunc(nextUpdate/1000)}s`)
    updateAccessTokenTimeout = setTimeout(updateToken, Math.max(nextUpdate, 0))
  }

  const authorize = (resp: { accessToken: string, refreshToken: string }) => {
    setJwt(resp.accessToken)
    window.localStorage.setItem("refreshToken-admin", resp.refreshToken)
    window.localStorage.setItem("accessToken-admin", resp.accessToken)

    updateAccessTokenTimer(resp.accessToken)
  }

  const updateToken = async () => {
    const lastUpdate = window.localStorage.getItem("refreshToken-admin-update")
    if (lastUpdate && parseInt(lastUpdate)+5000 > Date.now()) {
      await new Promise(res => setTimeout(res, parseInt(lastUpdate)+5000 - Date.now()))
      authorize({ 
        accessToken: window.localStorage.getItem("accessToken-admin")!, 
        refreshToken: window.localStorage.getItem("refreshToken-admin")!
      })
      return
    }
    window.localStorage.setItem("refreshToken-admin-update", Date.now().toString())
    
    const refreshToken = window.localStorage.getItem("refreshToken-admin")
    if (!refreshToken) throw new HTTPError({ error: "RefreshToken not exists" }, 403)
    const resp = await accountApi.updateToken(refreshToken)
    authorize(resp)
  }

  const init = async () => {
    const router = useRouter()
    const accessToken = window.localStorage.getItem("accessToken-admin")
    if (!accessToken || !accessToken.includes(".")) {
      status.value = "not-authorized"
      router.push("/auth")
      return
    }

    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1]))
      if (payload.exp - 10000 < Date.now()) {
        await updateToken()
      } else {
        updateAccessTokenTimer(accessToken)
        setJwt(accessToken)
      }
      await requestUserInfo()
      status.value = "authorized"
    } catch(e) {
      if (e instanceof HTTPError && e.statusCode === 403) {
        status.value = "not-authorized"
        router.push("/auth")
      } else {
        throw e
      }
    }
  }

  const login = async (login: string, password: string) => {
    const resp = await accountApi.login({ login, password })
    
    authorize(resp)
    await init()
  }

  const logout = async () => {
    const refreshToken = window.localStorage.getItem("refreshToken-admin")
    if (refreshToken) {
      await accountApi.logout(refreshToken)
    }
    window.localStorage.removeItem("refreshToken-admin")
    window.localStorage.removeItem("accessToken-admin")
    setJwt("")
    status.value = "not-authorized"
  }

  return {
    init,
    login,
    logout,
    status,
    currentUser,
    sidebarInfo,
    requestUserInfo
  }
})
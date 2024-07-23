import { createRouter, createWebHistory } from "vue-router";
import { useAccountStore } from "./stores/accountStore";
import HomePage from './pages/HomePage.vue'
import TablesPage from './pages/TablesPage.vue'
import AuthPage from './pages/AuthPage.vue'
import TableEditorPage from './pages/TableEditorPage.vue'
import DataViewPage from './pages/DataViewPage.vue'
import ViewsPage from './pages/ViewsPage.vue'
import ViewItemPage from './pages/ViewItemPage.vue'
import FormsPage from './pages/FormsPage.vue'
import FormItemPage from './pages/FormItemPage.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", component: HomePage },
    { path: "/tables", component: TablesPage },
    { path: "/views", component: ViewsPage },
    { path: "/views/:viewId", component: ViewItemPage },
    { path: "/forms", component: FormsPage },
    { path: "/forms/:formId", component: FormItemPage },
    { path: "/tables/:tableName", component: TableEditorPage },
    { path: "/auth", component: AuthPage, meta: { showSidebar: false } },
    { path: "/data/:tableName", component: DataViewPage }
  ]
})

router.beforeEach((to) => {
  const accountStore = useAccountStore()
  if (to.path.startsWith("/auth")) return
  if (accountStore.status === "not-authorized") {
    return '/auth'
  }
})

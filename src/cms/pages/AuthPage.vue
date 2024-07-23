<template>
  <div class="auth-page__layout">
    <VCard>
      <template #header>Вход в админ-панель</template>
      <form class="form-column" @submit="apply">
        <VInput v-bind="register('login')" label="Логин" placeholder="Введите ваш логин"/>
        <VInput v-bind="register('password')" label="Пароль" placeholder="Введите ваш пароль" type="password"/>
        <VButton type="submit">Войти</VButton>
      </form>
    </VCard>
  </div>
</template>

<script lang="ts" setup>
import { useForm } from 'vuesix';
import { useAccountStore } from '../stores/accountStore';
import { useRouter } from 'vue-router';

const accountStore = useAccountStore()
const router = useRouter()

const { register, handleSubmit } = useForm({
  login: "",
  password: ""
})

const apply = handleSubmit(async (values) => {
  await accountStore.login(values.login, values.password)
  router.push("/")
})

</script>

<style lang="sass">
.auth-page__layout
  display: flex
  justify-content: center
  align-items: center
  flex-direction: column
  height: 100vh

  .v-card
    width: 400px
    max-width: 94vw
</style>
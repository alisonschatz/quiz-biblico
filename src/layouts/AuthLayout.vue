<template>
  <q-layout view="lHh Lpr lFf" class="auth-layout">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'AuthLayout'
};
</script>

<style scoped lang="scss">
.auth-layout {
  background: var(--gradient-bg);
  min-height: 100vh;
}
</style>
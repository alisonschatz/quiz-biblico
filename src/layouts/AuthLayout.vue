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
  background: linear-gradient(135deg, #faf5ff 0%, #eff6ff 50%, #fef3c7 100%);
}
</style>

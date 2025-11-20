<template>
  <q-page class="flex flex-center error-page">
    <div class="text-center">
      <div class="error-icon q-mb-lg">
        <q-icon name="search_off" size="120px" color="grey-5" />
      </div>
      
      <h1 class="text-h2 text-weight-bold text-grey-8 q-mb-sm">
        404
      </h1>
      
      <p class="text-h5 text-grey-6 q-mb-xl">
        Página não encontrada
      </p>
      
      <q-btn
        to="/"
        color="primary"
        label="Voltar ao Início"
        unelevated
        rounded
        size="lg"
      />
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'Error404Page'
};
</script>

<style scoped lang="scss">
.error-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #faf5ff 0%, #eff6ff 50%, #fef3c7 100%);
}

.error-icon {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}
</style>

<template>
  <q-page class="auth-page flex flex-center">
    <q-card class="auth-card">
      <q-card-section class="text-center q-pa-lg">
        <div class="logo-container q-mb-lg">
          <q-icon name="menu_book" size="64px" color="primary" />
        </div>
        
        <h1 class="text-h4 text-weight-bold text-grey-9 q-mb-xs">
          Quiz Bíblico
        </h1>
        <p class="text-body2 text-grey-7 q-mb-xl">
          Entre para começar sua jornada
        </p>
        
        <q-form @submit="handleLogin" class="q-gutter-md">
          <q-input
            v-model="email"
            type="email"
            label="Email"
            outlined
            rounded
            :rules="[val => !!val || 'Email é obrigatório']"
          >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>
          
          <q-input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Senha"
            outlined
            rounded
            :rules="[val => !!val || 'Senha é obrigatória']"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>
          
          <q-btn
            type="submit"
            color="primary"
            label="Entrar"
            unelevated
            rounded
            size="lg"
            class="full-width"
            :loading="loading"
          />
        </q-form>
        
        <div class="q-mt-lg">
          <p class="text-body2 text-grey-7">
            Não tem uma conta?
            <router-link to="/auth/register" class="text-primary text-weight-medium">
              Cadastre-se
            </router-link>
          </p>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import authService from '../../services/auth.service';

export default {
  name: 'LoginPage',
  
  setup() {
    const router = useRouter();
    const $q = useQuasar();
    
    const email = ref('');
    const password = ref('');
    const showPassword = ref(false);
    const loading = ref(false);
    
    onMounted(() => {
      // Verifica se já está autenticado
      authService.onAuthStateChanged((user) => {
        if (user) {
          router.push('/');
        }
      });
    });
    
    const handleLogin = async () => {
      try {
        loading.value = true;
        
        // Usa authService diretamente
        await authService.login(email.value, password.value);
        
        $q.notify({
          type: 'positive',
          message: 'Login realizado com sucesso!',
          timeout: 2000
        });
        
        router.push('/');
      } catch (error) {
        let errorMessage = 'Erro ao fazer login';
        
        if (error.code === 'auth/user-not-found') {
          errorMessage = 'Usuário não encontrado';
        } else if (error.code === 'auth/wrong-password') {
          errorMessage = 'Senha incorreta';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Email inválido';
        } else if (error.code === 'auth/invalid-credential') {
          errorMessage = 'Email ou senha incorretos';
        }
        
        $q.notify({
          type: 'negative',
          message: errorMessage,
          timeout: 3000
        });
      } finally {
        loading.value = false;
      }
    };
    
    return {
      email,
      password,
      showPassword,
      loading,
      handleLogin
    };
  }
};
</script>

<style scoped lang="scss">
.auth-page {
  min-height: 100vh;
}

.auth-card {
  width: 100%;
  max-width: 450px;
  border: none;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border-radius: 24px;
}

.logo-container {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}
</style>
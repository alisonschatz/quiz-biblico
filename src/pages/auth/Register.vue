<template>
  <q-page class="auth-page flex flex-center">
    <q-card class="auth-card">
      <q-card-section class="text-center q-pa-lg">
        <div class="logo-container q-mb-lg">
          <q-icon name="menu_book" size="64px" color="primary" />
        </div>
        
        <h1 class="text-h4 text-weight-bold text-grey-9 q-mb-xs">
          Criar Conta
        </h1>
        <p class="text-body2 text-grey-7 q-mb-xl">
          Cadastre-se para começar
        </p>
        
        <q-form @submit="handleRegister" class="q-gutter-md">
          <q-input
            v-model="displayName"
            label="Nome Completo"
            outlined
            rounded
            :rules="[val => !!val || 'Nome é obrigatório']"
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>
          
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
            :rules="[
              val => !!val || 'Senha é obrigatória',
              val => val.length >= 6 || 'Senha deve ter no mínimo 6 caracteres'
            ]"
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
          
          <q-input
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            label="Confirmar Senha"
            outlined
            rounded
            :rules="[
              val => !!val || 'Confirme sua senha',
              val => val === password || 'As senhas não coincidem'
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
          </q-input>
          
          <q-btn
            type="submit"
            color="primary"
            label="Cadastrar"
            unelevated
            rounded
            size="lg"
            class="full-width"
            :loading="loading"
          />
        </q-form>
        
        <div class="q-mt-lg">
          <p class="text-body2 text-grey-7">
            Já tem uma conta?
            <router-link to="/auth/login" class="text-primary text-weight-medium">
              Entrar
            </router-link>
          </p>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import authService from '../../services/auth.service';
import userService from '../../services/user.service';

export default {
  name: 'RegisterPage',
  
  setup() {
    const router = useRouter();
    const $q = useQuasar();
    
    const displayName = ref('');
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const showPassword = ref(false);
    const loading = ref(false);
    
    const handleRegister = async () => {
      console.log('🔵 Iniciando registro...');
      
      try {
        loading.value = true;
        
        console.log('🔵 Criando usuário no Firebase Auth...');
        const user = await authService.register(email.value, password.value, displayName.value);
        console.log('✅ Usuário criado:', user.uid);
        
        console.log('🔵 Criando documento do usuário no Firestore...');
        await userService.createUserProgress(user.uid, email.value, displayName.value);
        console.log('✅ Documento criado no Firestore');
        
        $q.notify({
          type: 'positive',
          message: 'Conta criada com sucesso!',
          timeout: 2000
        });
        
        console.log('🔵 Redirecionando para login...');
        setTimeout(() => {
          router.push('/auth/login');
        }, 500);
        
      } catch (error) {
        console.error('❌ ERRO:', error);
        
        let errorMessage = 'Erro ao criar conta';
        
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Este email já está em uso';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Email inválido';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'Senha muito fraca (mínimo 6 caracteres)';
        } else if (error.code === 'auth/operation-not-allowed') {
          errorMessage = 'Erro: Ative Authentication (Email/Senha) no Firebase Console';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        $q.notify({
          type: 'negative',
          message: errorMessage,
          timeout: 5000
        });
      } finally {
        loading.value = false;
      }
    };
    
    return {
      displayName,
      email,
      password,
      confirmPassword,
      showPassword,
      loading,
      handleRegister
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
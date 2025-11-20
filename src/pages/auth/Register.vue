<template>
  <q-page class="auth-page">
    <!-- Background Pattern -->
    <div class="bg-pattern"></div>
    
    <div class="auth-container">
      <!-- Logo Section -->
      <div class="logo-section">
        <div class="logo-wrapper">
          <q-icon name="menu_book" class="logo-icon" />
          <div class="logo-glow"></div>
        </div>
        <h1 class="app-title">Quiz Bíblico</h1>
        <p class="app-subtitle">Comece sua jornada de conhecimento</p>
      </div>

      <!-- Auth Card -->
      <div class="auth-card">
        <div class="card-header">
          <h2 class="card-title">Criar nova conta</h2>
          <p class="card-subtitle">Junte-se a milhares de estudantes da Bíblia</p>
        </div>

        <!-- Google Sign In Button -->
        <q-btn
          unelevated
          no-caps
          class="google-btn"
          :loading="loadingGoogle"
          @click="handleGoogleRegister"
        >
          <div class="google-btn-content">
            <svg class="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continuar com Google</span>
          </div>
        </q-btn>

        <!-- Divider -->
        <div class="divider">
          <span class="divider-text">ou cadastre-se com email</span>
        </div>

        <!-- Registration Form -->
        <q-form @submit.prevent="handleRegister" class="auth-form">
          <div class="input-group">
            <label class="input-label">Nome Completo</label>
            <q-input
              v-model="displayName"
              dense
              outlined
              placeholder="João da Silva"
              class="custom-input"
              :rules="[val => !!val || 'Nome é obrigatório']"
            >
              <template v-slot:prepend>
                <q-icon name="person" class="input-icon" />
              </template>
            </q-input>
          </div>

          <div class="input-group">
            <label class="input-label">Email</label>
            <q-input
              v-model="email"
              type="email"
              dense
              outlined
              placeholder="seu@email.com"
              class="custom-input"
              :rules="[val => !!val || 'Email é obrigatório']"
            >
              <template v-slot:prepend>
                <q-icon name="mail" class="input-icon" />
              </template>
            </q-input>
          </div>

          <div class="input-group">
            <label class="input-label">Senha</label>
            <q-input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              dense
              outlined
              placeholder="Mínimo 6 caracteres"
              class="custom-input"
              :rules="[
                val => !!val || 'Senha é obrigatória',
                val => val.length >= 6 || 'Mínimo 6 caracteres'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="lock" class="input-icon" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer input-icon"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
          </div>

          <div class="input-group">
            <label class="input-label">Confirmar Senha</label>
            <q-input
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              dense
              outlined
              placeholder="Digite a senha novamente"
              class="custom-input"
              :rules="[
                val => !!val || 'Confirme sua senha',
                val => val === password || 'As senhas não coincidem'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="lock" class="input-icon" />
              </template>
            </q-input>
          </div>

          <q-btn
            type="submit"
            unelevated
            no-caps
            class="submit-btn"
            :loading="loading"
          >
            <span class="submit-btn-text">Criar Conta</span>
            <q-icon name="arrow_forward" class="submit-btn-icon" />
          </q-btn>
        </q-form>

        <!-- Footer -->
        <div class="card-footer">
          <p class="footer-text">
            Já tem uma conta?
            <router-link to="/auth/login" class="footer-link">
              Faça login
            </router-link>
          </p>
        </div>
      </div>

      <!-- Decorative Elements -->
      <div class="decorative-cross decorative-cross-1"></div>
      <div class="decorative-cross decorative-cross-2"></div>
    </div>
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
    const loadingGoogle = ref(false);
    
    const handleRegister = async () => {
      try {
        loading.value = true;
        
        const user = await authService.register(email.value, password.value, displayName.value);
        
        await userService.createUserProgress(user.uid, email.value, displayName.value);
        
        $q.notify({
          type: 'positive',
          message: 'Conta criada com sucesso!',
          icon: 'check_circle',
          timeout: 2000
        });
        
        setTimeout(() => {
          router.push('/auth/login');
        }, 500);
        
      } catch (error) {
        console.error('Registration error:', error);
        
        let errorMessage = 'Erro ao criar conta';
        
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Este email já está em uso';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Email inválido';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'Senha muito fraca (mínimo 6 caracteres)';
        } else if (error.code === 'auth/operation-not-allowed') {
          errorMessage = 'Erro: Ative Authentication no Firebase Console';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        $q.notify({
          type: 'negative',
          message: errorMessage,
          icon: 'error',
          timeout: 5000
        });
      } finally {
        loading.value = false;
      }
    };

    const handleGoogleRegister = async () => {
      try {
        loadingGoogle.value = true;
        
        await authService.loginWithGoogle();
        
        $q.notify({
          type: 'positive',
          message: 'Cadastro com Google realizado!',
          icon: 'check_circle',
          timeout: 2000
        });
        
        router.push('/');
      } catch (error) {
        console.error('Google register error:', error);
        
        $q.notify({
          type: 'negative',
          message: 'Erro ao cadastrar com Google',
          icon: 'error',
          timeout: 3000
        });
      } finally {
        loadingGoogle.value = false;
      }
    };
    
    return {
      displayName,
      email,
      password,
      confirmPassword,
      showPassword,
      loading,
      loadingGoogle,
      handleRegister,
      handleGoogleRegister
    };
  }
};
</script>

<style scoped lang="scss">
.auth-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: var(--gradient-bg);
}

.bg-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(139, 92, 46, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(101, 67, 33, 0.02) 0%, transparent 50%);
  pointer-events: none;
}

.auth-container {
  position: relative;
  min-height: 100vh;
  padding: var(--spacing-2xl) var(--spacing-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3xl);
  z-index: 1;
}

// Logo Section
.logo-section {
  text-align: center;
  animation: fadeInDown 0.6s ease-out;
}

.logo-wrapper {
  position: relative;
  width: 88px;
  height: 88px;
  margin: 0 auto var(--spacing-xl);
}

.logo-icon {
  font-size: 48px;
  color: var(--primary);
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 4px 12px rgba(139, 94, 52, 0.3));
  animation: float 3s ease-in-out infinite;
}

.logo-glow {
  position: absolute;
  inset: -8px;
  background: radial-gradient(circle, rgba(139, 94, 52, 0.15) 0%, transparent 70%);
  border-radius: var(--radius-full);
  animation: pulse 2s ease-in-out infinite;
}

.app-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0 0 var(--spacing-sm) 0;
  letter-spacing: -0.5px;
}

.app-subtitle {
  font-size: 15px;
  color: var(--text-medium);
  margin: 0;
  font-weight: 500;
}

// Auth Card
.auth-card {
  width: 100%;
  max-width: 440px;
  background: var(--bg-overlay);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-2xl);
  border: 1px solid rgba(139, 94, 52, 0.1);
  box-shadow: var(--shadow-lg), var(--shadow-sm);
  padding: var(--spacing-3xl) var(--spacing-2xl);
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.card-header {
  margin-bottom: 28px;
  text-align: center;
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0 0 var(--spacing-sm) 0;
}

.card-subtitle {
  font-size: 14px;
  color: var(--text-medium);
  margin: 0;
}

// Google Button
.google-btn {
  width: 100%;
  height: 52px;
  background: var(--white);
  border: 1.5px solid rgba(139, 94, 52, 0.15);
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-dark);
  transition: all var(--transition-base);
  margin-bottom: var(--spacing-2xl);

  &:hover {
    border-color: rgba(139, 94, 52, 0.3);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }
}

.google-btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
}

.google-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

// Divider
.divider {
  position: relative;
  text-align: center;
  margin: var(--spacing-2xl) 0;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: calc(50% - 75px);
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(139, 94, 52, 0.2), transparent);
  }

  &::before { left: 0; }
  &::after { right: 0; }
}

.divider-text {
  font-size: 13px;
  color: var(--text-medium);
  background: var(--bg-overlay);
  padding: 0 var(--spacing-lg);
  font-weight: 500;
}

// Form
.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.input-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-dark);
  margin-left: 4px;
}

:deep(.custom-input) {
  .q-field__control {
    height: 48px;
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0.6);
    border: 1.5px solid rgba(139, 94, 52, 0.15);
    transition: all var(--transition-base);

    &::before {
      border: none;
    }
  }

  .q-field__native {
    color: var(--text-dark);
    font-weight: 500;
    font-size: 15px;
  }

  &.q-field--focused .q-field__control {
    border-color: var(--primary);
    background: var(--white);
    box-shadow: 0 0 0 4px rgba(139, 94, 52, 0.1);
  }

  .q-field__marginal {
    height: 48px;
  }
}

.input-icon {
  color: var(--text-medium);
  font-size: 20px;
}

// Submit Button
.submit-btn {
  width: 100%;
  height: 52px;
  background: var(--gradient-primary);
  border-radius: var(--radius-md);
  color: var(--white);
  font-size: 16px;
  font-weight: 600;
  margin-top: var(--spacing-sm);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  &:active {
    transform: translateY(0);
  }
}

.submit-btn-text {
  margin-right: var(--spacing-sm);
}

.submit-btn-icon {
  font-size: 20px;
  transition: transform var(--transition-base);
}

.submit-btn:hover .submit-btn-icon {
  transform: translateX(4px);
}

// Footer
.card-footer {
  margin-top: var(--spacing-2xl);
  text-align: center;
  padding-top: var(--spacing-2xl);
  border-top: 1px solid rgba(139, 94, 52, 0.1);
}

.footer-text {
  font-size: 14px;
  color: var(--text-medium);
  margin: 0;
}

.footer-link {
  color: var(--primary);
  font-weight: 600;
  text-decoration: none;
  transition: color var(--transition-fast);

  &:hover {
    color: var(--primary-dark);
    text-decoration: underline;
  }
}

// Decorative Crosses
.decorative-cross {
  position: absolute;
  width: 40px;
  height: 40px;
  opacity: 0.08;
  pointer-events: none;

  &::before,
  &::after {
    content: '';
    position: absolute;
    background: var(--primary);
  }

  &::before {
    width: 8px;
    height: 100%;
    left: 50%;
    transform: translateX(-50%);
  }

  &::after {
    width: 100%;
    height: 8px;
    top: 50%;
    transform: translateY(-50%);
  }
}

.decorative-cross-1 {
  top: 10%;
  right: 10%;
  animation: float 4s ease-in-out infinite;
}

.decorative-cross-2 {
  bottom: 15%;
  left: 8%;
  animation: float 5s ease-in-out infinite 1s;
}

// Mobile Responsive
@media (max-width: 480px) {
  .auth-container {
    padding: var(--spacing-xl) var(--spacing-lg);
    gap: var(--spacing-2xl);
  }

  .logo-wrapper {
    width: 72px;
    height: 72px;
  }

  .logo-icon {
    font-size: 40px;
  }

  .app-title {
    font-size: 28px;
  }

  .app-subtitle {
    font-size: 14px;
  }

  .auth-card {
    padding: 28px var(--spacing-xl);
  }

  .card-title {
    font-size: 22px;
  }

  .google-btn,
  .submit-btn {
    height: 48px;
  }
}

@media (min-width: 768px) {
  .auth-container {
    padding: var(--spacing-4xl) var(--spacing-2xl);
  }

  .auth-card {
    padding: var(--spacing-4xl) var(--spacing-3xl);
  }
}
</style>
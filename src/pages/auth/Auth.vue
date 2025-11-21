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
        <p class="app-subtitle">Teste seu conhecimento das Escrituras</p>
      </div>

      <!-- Auth Card -->
      <div class="auth-card">
        <div class="card-header">
          <h2 class="card-title">Bem-vindo</h2>
          <p class="card-subtitle">Entre ou crie sua conta para começar</p>
        </div>

        <!-- Google Sign In Button -->
        <q-btn
          unelevated
          no-caps
          class="google-btn"
          :loading="loadingGoogle"
          @click="handleGoogleAuth"
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

        <!-- Benefits Section -->
        <div class="benefits-section">
          <div class="benefit-item">
            <q-icon name="check_circle" class="benefit-icon" />
            <span class="benefit-text">Acesso rápido e seguro</span>
          </div>
          <div class="benefit-item">
            <q-icon name="sync" class="benefit-icon" />
            <span class="benefit-text">Sincronize seu progresso</span>
          </div>
          <div class="benefit-item">
            <q-icon name="emoji_events" class="benefit-icon" />
            <span class="benefit-text">Conquiste troféus e badges</span>
          </div>
        </div>

        <!-- Privacy Note -->
        <div class="privacy-note">
          <q-icon name="lock" class="privacy-icon" />
          <p class="privacy-text">
            Seus dados estão seguros. Usamos autenticação do Google para garantir a segurança da sua conta.
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import authService from '../../services/auth.service';

export default {
  name: 'AuthPage',
  
  setup() {
    const router = useRouter();
    const $q = useQuasar();
    
    const loadingGoogle = ref(false);
    
    onMounted(() => {
      authService.onAuthStateChanged((user) => {
        if (user) {
          router.push('/');
        }
      });
    });

    const handleGoogleAuth = async () => {
      try {
        loadingGoogle.value = true;
        
        await authService.loginWithGoogle();
        
        $q.notify({
          type: 'positive',
          message: 'Bem-vindo ao Quiz Bíblico!',
          icon: 'check_circle',
          timeout: 2000
        });
        
        router.push('/');
      } catch (error) {
        console.error('Google auth error:', error);
        
        let errorMessage = 'Erro ao autenticar com Google';
        
        if (error.code === 'auth/popup-closed-by-user') {
          errorMessage = 'Login cancelado';
        } else if (error.code === 'auth/popup-blocked') {
          errorMessage = 'Pop-up bloqueado. Permita pop-ups para este site.';
        }
        
        $q.notify({
          type: 'negative',
          message: errorMessage,
          icon: 'error',
          timeout: 3000
        });
      } finally {
        loadingGoogle.value = false;
      }
    };
    
    return {
      loadingGoogle,
      handleGoogleAuth
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
  margin-bottom: 32px;
  text-align: center;
}

.card-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0 0 var(--spacing-sm) 0;
}

.card-subtitle {
  font-size: 15px;
  color: var(--text-medium);
  margin: 0;
}

// Google Button
.google-btn {
  width: 100%;
  height: 56px;
  background: var(--white);
  border: 2px solid rgba(139, 94, 52, 0.15);
  border-radius: var(--radius-lg);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-dark);
  transition: all var(--transition-base);
  margin-bottom: var(--spacing-2xl);

  &:hover {
    border-color: rgba(139, 94, 52, 0.3);
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

.google-btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
}

.google-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

// Benefits Section
.benefits-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-xl) 0;
  border-top: 1px solid rgba(139, 94, 52, 0.1);
  border-bottom: 1px solid rgba(139, 94, 52, 0.1);
  margin-bottom: var(--spacing-xl);
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.benefit-icon {
  color: var(--primary);
  font-size: 20px;
  flex-shrink: 0;
}

.benefit-text {
  font-size: 14px;
  color: var(--text-dark);
  font-weight: 500;
}

// Privacy Note
.privacy-note {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: rgba(139, 94, 52, 0.03);
  border-radius: var(--radius-md);
  border: 1px solid rgba(139, 94, 52, 0.1);
}

.privacy-icon {
  color: var(--text-medium);
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.privacy-text {
  font-size: 12px;
  color: var(--text-medium);
  line-height: 1.5;
  margin: 0;
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

// Animations
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.15;
  }
  50% {
    opacity: 0.25;
  }
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
    font-size: 24px;
  }

  .google-btn {
    height: 52px;
  }

  .benefit-text {
    font-size: 13px;
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
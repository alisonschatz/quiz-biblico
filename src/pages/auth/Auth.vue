<template>
  <q-page class="auth-page">
    <div class="bg-pattern"></div>    
    <div class="auth-container">
      <div class="logo-section">
        <div class="logo-wrapper">
          <q-icon name="menu_book" class="logo-icon" />
          <div class="logo-glow"></div>
        </div>
        <h1 class="app-title">Quiz Bíblico</h1>
        <p class="app-subtitle">Teste seu conhecimento das Escrituras</p>
      </div>

      <div class="auth-card">
        <div class="card-header">
          <h2 class="card-title">Bem-vindo</h2>
          <p class="card-subtitle">Entre ou crie sua conta para começar</p>
        </div>

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

        <div class="privacy-note">
          <q-icon name="lock" class="privacy-icon" />
          <p class="privacy-text">
            Seus dados estão seguros. Usamos autenticação do Google para garantir a segurança da sua conta.
          </p>
        </div>
      </div>

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

<style src="/src/css/pages/auth/auth.scss" scoped></style>
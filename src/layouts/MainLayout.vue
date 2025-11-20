<template>
  <q-layout view="hHh Lpr fFf">
    <!-- Header -->
    <q-header elevated class="app-header">
      <q-toolbar class="header-toolbar">
        <!-- Logo -->
        <div class="header-logo">
          <q-icon name="menu_book" class="logo-icon" />
          <span class="logo-text">Quiz Bíblico</span>
        </div>

        <q-space />

        <!-- User Menu -->
        <UserMenu
          :name="userName"
          :email="userEmail"
          :photo-u-r-l="userPhotoURL"
          :user-stats="userStats"
          @profile="goToProfile"
          @achievements="goToAchievements"
          @ranking="goToRanking"
          @logout="handleLogout"
        />
      </q-toolbar>
    </q-header>

    <!-- Page Content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Bottom Navigation -->
    <q-footer class="bottom-nav">
      <q-tabs
        v-model="currentTab"
        active-color="white"
        active-bg-color="primary"
        indicator-color="transparent"
        class="nav-tabs"
      >
        <q-route-tab
          v-for="tab in navigationTabs"
          :key="tab.name"
          :name="tab.name"
          :to="tab.to"
          :icon="tab.icon"
          :label="tab.label"
          :class="['nav-tab', tab.class]"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import UserMenu from './UserMenu.vue';
import authService from '/src/services/auth.service';
import userService from '/src/services/user.service';

export default {
  name: 'MainLayout',

  components: {
    UserMenu
  },

  setup() {
    const route = useRoute();
    const router = useRouter();
    const $q = useQuasar();

    // State
    const currentTab = ref('home');
    const userName = ref('Usuário');
    const userEmail = ref('');
    const userPhotoURL = ref('');
    const userStats = ref({
      totalPoints: 0,
      achievements: 0,
      quizzesCompleted: 0
    });

    // Navigation tabs configuration
    const navigationTabs = computed(() => [
      {
        name: 'home',
        to: '/',
        icon: 'home',
        label: 'Home'
      },
      {
        name: 'quiz',
        to: '/quiz',
        icon: 'play_circle',
        label: 'Quiz',
        class: 'nav-tab-primary'
      },
      {
        name: 'achievements',
        to: '/achievements',
        icon: 'emoji_events',
        label: 'Conquistas'
      },
      {
        name: 'ranking',
        to: '/ranking',
        icon: 'leaderboard',
        label: 'Ranking'
      }
    ]);

    // Sincroniza aba com rota
    watch(
      () => route.name,
      (newName) => {
        currentTab.value = newName;
      },
      { immediate: true }
    );

    // Carrega dados do usuário
    const loadUserData = async () => {
      const user = authService.getCurrentUser();
      if (!user) return;

      userName.value = user.displayName || 'Usuário';
      userEmail.value = user.email || '';
      userPhotoURL.value = user.photoURL || '';

      try {
        const userData = await userService.getUserProgress(user.uid);
        if (userData) {
          userStats.value = {
            totalPoints: userData.totalPoints || 0,
            achievements: userData.achievements?.length || 0,
            quizzesCompleted: userData.quizzesCompleted || 0
          };
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }
    };

    onMounted(loadUserData);

    // Navigation handlers
    const goToProfile = () => router.push('/profile');
    const goToAchievements = () => router.push('/achievements');
    const goToRanking = () => router.push('/ranking');

    // Logout handler
    const handleLogout = () => {
      $q.dialog({
        title: 'Confirmar saída',
        message: 'Tem certeza que deseja sair?',
        cancel: {
          label: 'Cancelar',
          flat: true,
          color: 'grey-7'
        },
        ok: {
          label: 'Sair',
          color: 'negative',
          unelevated: true
        },
        persistent: true
      }).onOk(async () => {
        try {
          await authService.logout();
          $q.notify({
            type: 'positive',
            message: 'Logout realizado com sucesso',
            icon: 'logout',
            timeout: 2000
          });
          router.push('/auth/login');
        } catch (error) {
          console.error('Erro no logout:', error);
          $q.notify({
            type: 'negative',
            message: 'Erro ao fazer logout',
            icon: 'error',
            timeout: 3000
          });
        }
      });
    };

    return {
      currentTab,
      userName,
      userEmail,
      userPhotoURL,
      userStats,
      navigationTabs,
      goToProfile,
      goToAchievements,
      goToRanking,
      handleLogout
    };
  }
};
</script>

<style scoped lang="scss">
/* ========================================
   HEADER
   ======================================== */
.app-header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(139, 94, 52, 0.1);
  box-shadow: 0 2px 12px rgba(139, 94, 52, 0.06);
}

.header-toolbar {
  padding: 0 var(--spacing-xl);
  min-height: 64px;
}

/* ========================================
   LOGO
   ======================================== */
.header-logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-base);

  &:hover {
    transform: translateX(4px);
  }
}

.logo-icon {
  font-size: 32px;
  color: var(--primary);
  filter: drop-shadow(0 2px 4px rgba(139, 94, 52, 0.2));
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-dark);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

/* ========================================
   BOTTOM NAVIGATION
   ======================================== */
.bottom-nav {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(139, 94, 52, 0.1);
  box-shadow: 0 -4px 20px rgba(139, 94, 52, 0.06);
}

.nav-tabs {
  :deep(.q-tabs__content) {
    gap: 4px;
  }
}

:deep(.nav-tab) {
  border-radius: 14px;
  margin: var(--spacing-sm) 4px;
  transition: all var(--transition-base);

  .q-tab__label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.3px;
  }

  .q-tab__icon {
    font-size: 24px;
  }

  &.q-tab--active {
    background: var(--gradient-primary);
    box-shadow: var(--shadow-md);

    .q-tab__label,
    .q-tab__icon {
      color: var(--white);
    }
  }

  &:not(.q-tab--active) {
    .q-tab__icon {
      color: var(--primary-light);
    }

    .q-tab__label {
      color: var(--text-medium);
    }

    &:hover {
      background: rgba(139, 94, 52, 0.05);
    }
  }
}

:deep(.nav-tab-primary) {
  &.q-tab--active {
    transform: translateY(-4px);

    &::before {
      content: '';
      position: absolute;
      inset: -3px;
      background: var(--gradient-primary);
      border-radius: 16px;
      opacity: 0.3;
      filter: blur(8px);
      z-index: -1;
    }
  }
}

/* ========================================
   RESPONSIVE
   ======================================== */
@media (max-width: 480px) {
  .logo-text {
    font-size: 18px;
  }
}

@media (max-width: 360px) {
  .logo-text {
    display: none;
  }

  :deep(.nav-tab) .q-tab__label {
    font-size: 10px;
  }
}

@media (min-width: 768px) {
  .header-toolbar {
    padding: 0 var(--spacing-3xl);
  }
}
</style>
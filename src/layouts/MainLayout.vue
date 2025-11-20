<template>
  <q-layout view="hHh Lpr fFf">
    <!-- Header with Profile -->
    <q-header elevated class="app-header">
      <q-toolbar class="header-toolbar">
        <!-- Logo -->
        <div class="header-logo">
          <q-icon name="menu_book" class="logo-icon" />
          <span class="logo-text">Quiz Bíblico</span>
        </div>

        <q-space />

        <!-- User Profile Button -->
        <div class="profile-wrapper">
          <q-btn
            flat
            round
            dense
            class="profile-btn"
          >
            <q-avatar size="36px" class="profile-avatar">
              <img v-if="userPhotoURL" :src="userPhotoURL" alt="Profile" />
              <q-icon v-else name="person" size="20px" />
            </q-avatar>

          <!-- Profile Menu -->
          <q-menu
            anchor="bottom right"
            self="top right"
            :offset="[0, 8]"
            class="profile-menu"
          >
            <q-card class="profile-card">
              <!-- User Info Section -->
              <q-card-section class="profile-header">
                <div class="profile-avatar-large">
                  <img v-if="userPhotoURL" :src="userPhotoURL" alt="Profile" />
                  <q-icon v-else name="person" size="32px" />
                </div>
                <div class="profile-info">
                  <div class="profile-name">{{ userName }}</div>
                  <div class="profile-email">{{ userEmail }}</div>
                </div>
              </q-card-section>

              <q-separator />

              <!-- Stats Section -->
              <q-card-section class="profile-stats">
                <div class="stat-item">
                  <q-icon name="emoji_events" class="stat-icon" />
                  <div class="stat-content">
                    <div class="stat-value">{{ userStats.totalPoints }}</div>
                    <div class="stat-label">Pontos</div>
                  </div>
                </div>
                <div class="stat-item">
                  <q-icon name="workspace_premium" class="stat-icon" />
                  <div class="stat-content">
                    <div class="stat-value">{{ userStats.achievements }}</div>
                    <div class="stat-label">Conquistas</div>
                  </div>
                </div>
                <div class="stat-item">
                  <q-icon name="psychology" class="stat-icon" />
                  <div class="stat-content">
                    <div class="stat-value">{{ userStats.quizzesCompleted }}</div>
                    <div class="stat-label">Quiz Feitos</div>
                  </div>
                </div>
              </q-card-section>

              <q-separator />

              <!-- Menu Options -->
              <q-list class="profile-menu-list">
                <q-item clickable v-close-popup @click="goToProfile">
                  <q-item-section avatar>
                    <q-icon name="account_circle" color="grey-7" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Meu Perfil</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="goToAchievements">
                  <q-item-section avatar>
                    <q-icon name="military_tech" color="grey-7" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Minhas Conquistas</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="goToRanking">
                  <q-item-section avatar>
                    <q-icon name="leaderboard" color="grey-7" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Ranking</q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item clickable v-close-popup @click="handleLogout" class="logout-item">
                  <q-item-section avatar>
                    <q-icon name="logout" color="negative" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-negative">Sair</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </q-menu>
        </q-btn>
        </div>
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
          name="home"
          to="/"
          icon="home"
          label="Home"
          class="nav-tab"
        />
        <q-route-tab
          name="quiz"
          to="/quiz"
          icon="play_circle"
          label="Quiz"
          class="nav-tab nav-tab-primary"
        />
        <q-route-tab
          name="achievements"
          to="/achievements"
          icon="emoji_events"
          label="Conquistas"
          class="nav-tab"
        />
        <q-route-tab
          name="ranking"
          to="/ranking"
          icon="leaderboard"
          label="Ranking"
          class="nav-tab"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script>
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import authService from '/src/services/auth.service';
import userService from '/src/services/user.service';

export default {
  name: 'MainLayout',
  
  setup() {
    const route = useRoute();
    const router = useRouter();
    const $q = useQuasar();
    
    const currentTab = ref('home');
    const userName = ref('Usuário');
    const userEmail = ref('');
    const userPhotoURL = ref('');
    const userStats = ref({
      totalPoints: 0,
      achievements: 0,
      quizzesCompleted: 0
    });
    
    watch(() => route.name, (newName) => {
      currentTab.value = newName;
    }, { immediate: true });

    onMounted(async () => {
      // Load user data
      const user = authService.getCurrentUser();
      if (user) {
        userName.value = user.displayName || 'Usuário';
        userEmail.value = user.email || '';
        userPhotoURL.value = user.photoURL || '';

        // Load user stats from Firestore
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
          console.error('Error loading user stats:', error);
        }
      }
    });

    const goToProfile = () => {
      router.push('/profile');
    };

    const goToAchievements = () => {
      router.push('/achievements');
    };

    const goToRanking = () => {
      router.push('/ranking');
    };

    const handleLogout = async () => {
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
          console.error('Logout error:', error);
          
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
      goToProfile,
      goToAchievements,
      goToRanking,
      handleLogout
    };
  }
};
</script>

<style scoped lang="scss">
// Header Styles
.app-header {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(139, 94, 52, 0.1);
}

.header-toolbar {
  min-height: 64px;
  padding: 0 var(--spacing-lg);
}

.header-logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.logo-icon {
  font-size: 28px;
  color: var(--primary);
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-dark);
  letter-spacing: -0.3px;
}

.profile-wrapper {
  display: flex;
  align-items: center;
  height: 100%;
}

.profile-btn {
  transition: all var(--transition-base);

  &:hover {
    transform: scale(1.05);
  }
}

.profile-avatar {
  border: 2px solid rgba(139, 94, 52, 0.2);
  background: linear-gradient(135deg, rgba(139, 94, 52, 0.1) 0%, rgba(93, 78, 55, 0.1) 100%);
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .q-icon {
    color: var(--primary);
  }
}

// Profile Menu
:deep(.profile-menu) {
  .q-menu__backdrop {
    backdrop-filter: blur(4px);
  }
}

.profile-card {
  width: 320px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(139, 94, 52, 0.1);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.profile-header {
  padding: var(--spacing-2xl);
  background: linear-gradient(135deg, rgba(139, 94, 52, 0.05) 0%, rgba(245, 241, 232, 0.5) 100%);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.profile-avatar-large {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  border: 3px solid rgba(139, 94, 52, 0.2);
  background: linear-gradient(135deg, rgba(139, 94, 52, 0.1) 0%, rgba(93, 78, 55, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .q-icon {
    color: var(--primary);
  }
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-email {
  font-size: 13px;
  color: var(--text-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-stats {
  padding: var(--spacing-xl) var(--spacing-2xl);
  display: flex;
  gap: var(--spacing-lg);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-sm);
  background: rgba(139, 94, 52, 0.03);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);

  &:hover {
    background: rgba(139, 94, 52, 0.06);
    transform: translateY(-2px);
  }
}

.stat-icon {
  font-size: 24px;
  color: var(--primary);
}

.stat-content {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: var(--text-medium);
  margin-top: 4px;
  font-weight: 600;
}

.profile-menu-list {
  padding: var(--spacing-sm);

  .q-item {
    border-radius: var(--radius-sm);
    margin-bottom: 4px;
    transition: all var(--transition-base);

    &:hover {
      background: rgba(139, 94, 52, 0.05);
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .logout-item:hover {
    background: rgba(244, 67, 54, 0.05);
  }

  .q-item__label {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-dark);
  }
}

// Bottom Navigation
.bottom-nav {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(139, 94, 52, 0.1);
  box-shadow: 0 -4px 20px rgba(139, 94, 52, 0.06);
}

.nav-tabs {
  .q-tabs__content {
    gap: 4px;
  }
}

:deep(.nav-tab) {
  border-radius: 14px;
  margin: var(--spacing-sm) 4px;
  transition: all var(--transition-base);
  position: relative;
  
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

// Primary Tab (Quiz) - Special Highlight
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

// Mobile Responsive
@media (max-width: 480px) {
  .logo-text {
    font-size: 18px;
  }

  .profile-card {
    width: calc(100vw - 32px);
    max-width: 320px;
  }

  .profile-stats {
    padding: var(--spacing-lg) var(--spacing-xl);
    gap: var(--spacing-md);
  }

  .stat-item {
    padding: 10px 6px;
  }

  .stat-icon {
    font-size: 22px;
  }

  .stat-value {
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
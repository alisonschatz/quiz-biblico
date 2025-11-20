<template>
  <q-page class="profile-page">
    <div class="profile-container">
      <!-- Header Section -->
      <div class="profile-banner">
        <div class="banner-overlay"></div>
        <div class="profile-header-content">
          <div class="avatar-wrapper">
            <q-avatar size="120px" class="profile-avatar-large">
              <img v-if="userPhotoURL" :src="userPhotoURL" alt="Profile" />
              <q-icon v-else name="person" size="56px" />
            </q-avatar>
            <div class="level-badge">
              <q-icon name="workspace_premium" />
              <span>Nv {{ userLevel }}</span>
            </div>
          </div>
          
          <h1 class="profile-name">{{ userName }}</h1>
          <p class="profile-email">{{ userEmail }}</p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon-wrapper stat-primary">
            <q-icon name="emoji_events" class="stat-icon" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ userStats.totalPoints }}</div>
            <div class="stat-label">Pontos Totais</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper stat-success">
            <q-icon name="psychology" class="stat-icon" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ userStats.quizzesCompleted }}</div>
            <div class="stat-label">Quiz Completos</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper stat-warning">
            <q-icon name="military_tech" class="stat-icon" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ userStats.achievements }}</div>
            <div class="stat-label">Conquistas</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper stat-info">
            <q-icon name="trending_up" class="stat-icon" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ userStats.streak }}</div>
            <div class="stat-label">Dias Seguidos</div>
          </div>
        </div>
      </div>

      <!-- Progress Section -->
      <div class="progress-section">
        <div class="section-header">
          <h2 class="section-title">Progresso por Categoria</h2>
          <q-icon name="auto_graph" class="section-icon" />
        </div>

        <div class="progress-list">
          <div 
            v-for="category in categoryProgress" 
            :key="category.name"
            class="progress-item"
          >
            <div class="progress-header">
              <span class="progress-name">{{ category.name }}</span>
              <span class="progress-percentage">{{ category.percentage }}%</span>
            </div>
            <q-linear-progress
              :value="category.percentage / 100"
              rounded
              size="8px"
              :color="category.color"
              track-color="grey-3"
              class="progress-bar"
            />
            <div class="progress-stats">
              <span class="progress-stat">
                <q-icon name="check_circle" size="14px" />
                {{ category.completed }} concluídos
              </span>
              <span class="progress-stat">
                <q-icon name="schedule" size="14px" />
                {{ category.remaining }} restantes
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Achievements -->
      <div class="achievements-section">
        <div class="section-header">
          <h2 class="section-title">Últimas Conquistas</h2>
          <router-link to="/achievements" class="section-link">
            Ver todas
            <q-icon name="arrow_forward" size="16px" />
          </router-link>
        </div>

        <div class="achievements-grid">
          <div 
            v-for="achievement in recentAchievements" 
            :key="achievement.id"
            class="achievement-card"
          >
            <div class="achievement-icon">
              <q-icon :name="achievement.icon" />
            </div>
            <div class="achievement-info">
              <div class="achievement-name">{{ achievement.name }}</div>
              <div class="achievement-date">{{ achievement.date }}</div>
            </div>
            <q-icon name="verified" class="achievement-badge" color="amber" />
          </div>
        </div>
      </div>

      <!-- Account Actions -->
      <div class="actions-section">
        <q-btn
          unelevated
          no-caps
          class="action-btn"
          icon="edit"
          label="Editar Perfil"
          @click="editProfile"
        />
        <q-btn
          unelevated
          no-caps
          class="action-btn"
          icon="settings"
          label="Configurações"
          @click="openSettings"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import authService from '/src/services/auth.service';
import userService from '/src/services/user.service';

export default {
  name: 'ProfilePage',
  
  setup() {
    const router = useRouter();
    const $q = useQuasar();
    
    const userName = ref('Carregando...');
    const userEmail = ref('');
    const userPhotoURL = ref('');
    const userLevel = ref(1);
    
    const userStats = ref({
      totalPoints: 0,
      quizzesCompleted: 0,
      achievements: 0,
      streak: 0
    });

    const categoryProgress = ref([
      { name: 'Antigo Testamento', percentage: 65, completed: 13, remaining: 7, color: 'brown-8' },
      { name: 'Novo Testamento', percentage: 80, completed: 16, remaining: 4, color: 'brown-7' },
      { name: 'Profetas', percentage: 45, completed: 9, remaining: 11, color: 'brown-6' },
      { name: 'Evangelhos', percentage: 90, completed: 18, remaining: 2, color: 'brown-5' }
    ]);

    const recentAchievements = ref([
      { id: 1, name: 'Primeiro Quiz', icon: 'stars', date: 'Há 2 dias' },
      { id: 2, name: '10 Quiz Completos', icon: 'emoji_events', date: 'Há 5 dias' },
      { id: 3, name: 'Mestre do NT', icon: 'military_tech', date: 'Há 1 semana' }
    ]);

    onMounted(async () => {
      const user = authService.getCurrentUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      userName.value = user.displayName || 'Usuário';
      userEmail.value = user.email || '';
      userPhotoURL.value = user.photoURL || '';

      try {
        const userData = await userService.getUserProgress(user.uid);
        if (userData) {
          userStats.value = {
            totalPoints: userData.totalPoints || 0,
            quizzesCompleted: userData.quizzesCompleted || 0,
            achievements: userData.achievements?.length || 0,
            streak: userData.currentStreak || 0
          };

          // Calculate level based on points
          userLevel.value = Math.floor(userData.totalPoints / 100) + 1;
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        $q.notify({
          type: 'negative',
          message: 'Erro ao carregar dados do perfil',
          icon: 'error'
        });
      }
    });

    const editProfile = () => {
      $q.notify({
        type: 'info',
        message: 'Função em desenvolvimento',
        icon: 'info'
      });
    };

    const openSettings = () => {
      $q.notify({
        type: 'info',
        message: 'Função em desenvolvimento',
        icon: 'info'
      });
    };

    return {
      userName,
      userEmail,
      userPhotoURL,
      userLevel,
      userStats,
      categoryProgress,
      recentAchievements,
      editProfile,
      openSettings
    };
  }
};
</script>

<style scoped lang="scss">
.profile-page {
  background: var(--gradient-bg);
  min-height: 100vh;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 0 80px 0;
}

// Header Banner
.profile-banner {
  position: relative;
  height: 280px;
  background: var(--gradient-primary);
  overflow: hidden;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(0, 0, 0, 0.1) 0%, transparent 50%);
}

.profile-header-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  padding: 0 var(--spacing-xl) var(--spacing-3xl);
}

.avatar-wrapper {
  position: relative;
  margin-bottom: var(--spacing-lg);
}

.profile-avatar-large {
  border: 4px solid rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-xl);
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .q-icon {
    color: var(--white);
  }
}

.level-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: var(--gradient-gold);
  border: 3px solid var(--white);
  border-radius: var(--spacing-xl);
  padding: 4px var(--spacing-md);
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);

  .q-icon {
    font-size: 16px;
    color: var(--white);
  }

  span {
    font-size: 12px;
    font-weight: 700;
    color: var(--white);
  }
}

.profile-name {
  font-size: 24px;
  font-weight: 700;
  color: var(--white);
  margin: 0 0 6px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
  word-break: break-word;
  max-width: 100%;
  line-height: 1.2;
}

.profile-email {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  text-align: center;
  word-break: break-all;
  max-width: 100%;
}

// Stats Grid
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  padding: var(--spacing-xl) var(--spacing-lg);
  margin-top: -40px;
  position: relative;
  z-index: 3;
}

.stat-card {
  background: var(--bg-overlay);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  border: 1px solid rgba(139, 94, 52, 0.1);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.stat-primary { background: rgba(139, 94, 52, 0.1); }
  &.stat-success { background: rgba(34, 197, 94, 0.1); }
  &.stat-warning { background: rgba(251, 191, 36, 0.1); }
  &.stat-info { background: rgba(59, 130, 246, 0.1); }

  .stat-icon {
    font-size: 24px;
  }

  &.stat-primary .stat-icon { color: var(--primary); }
  &.stat-success .stat-icon { color: var(--success); }
  &.stat-warning .stat-icon { color: var(--warning); }
  &.stat-info .stat-icon { color: var(--info); }
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-medium);
  font-weight: 600;
}

// Sections
.progress-section,
.achievements-section {
  padding: 0 var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.section-icon {
  font-size: 24px;
  color: var(--primary);
}

.section-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
  text-decoration: none;
  transition: all var(--transition-base);

  &:hover {
    color: var(--primary-dark);
    gap: var(--spacing-sm);
  }
}

// Progress List
.progress-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.progress-item {
  background: var(--bg-overlay);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  border: 1px solid rgba(139, 94, 52, 0.1);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.progress-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-dark);
}

.progress-percentage {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
}

.progress-bar {
  margin-bottom: var(--spacing-md);
}

.progress-stats {
  display: flex;
  gap: var(--spacing-lg);
}

.progress-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-medium);

  .q-icon {
    color: var(--primary-light);
  }
}

// Achievements Grid
.achievements-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.achievement-card {
  background: var(--bg-overlay);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  border: 1px solid rgba(139, 94, 52, 0.1);
  transition: all var(--transition-base);

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateX(4px);
  }
}

.achievement-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .q-icon {
    font-size: 24px;
    color: var(--gold-dark);
  }
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 4px;
}

.achievement-date {
  font-size: 12px;
  color: var(--text-medium);
}

.achievement-badge {
  font-size: 24px;
  flex-shrink: 0;
}

// Actions Section
.actions-section {
  padding: 0 var(--spacing-lg);
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-3xl);
}

.action-btn {
  flex: 1;
  height: 52px;
  background: var(--bg-overlay);
  backdrop-filter: blur(20px);
  border: 1.5px solid rgba(139, 94, 52, 0.2);
  border-radius: var(--radius-md);
  color: var(--text-dark);
  font-size: 15px;
  font-weight: 600;
  transition: all var(--transition-base);

  &:hover {
    background: var(--white);
    border-color: var(--primary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

// Mobile Responsive
@media (max-width: 480px) {
  .profile-banner {
    height: 260px;
  }

  .profile-header-content {
    padding: 0 var(--spacing-lg) 28px;
  }

  .profile-avatar-large {
    width: 100px !important;
    height: 100px !important;
    border-width: 3px;
  }

  .level-badge {
    bottom: -2px;
    right: -2px;
    padding: 3px 10px;
    border-width: 2px;

    .q-icon {
      font-size: 14px;
    }

    span {
      font-size: 11px;
    }
  }

  .profile-name {
    font-size: 20px;
    margin-bottom: 4px;
    padding: 0 var(--spacing-sm);
  }

  .profile-email {
    font-size: 12px;
    padding: 0 var(--spacing-sm);
  }

  .stats-grid {
    gap: 10px;
    padding: var(--spacing-lg) var(--spacing-md);
    margin-top: -30px;
  }

  .stat-card {
    padding: var(--spacing-lg);
  }

  .stat-icon-wrapper {
    width: 44px;
    height: 44px;
  }

  .stat-value {
    font-size: 20px;
  }

  .actions-section {
    flex-direction: column;
  }
}

@media (min-width: 768px) {
  .profile-container {
    padding: 0 var(--spacing-xl) 100px var(--spacing-xl);
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-lg);
    padding: var(--spacing-2xl) var(--spacing-xl);
  }

  .progress-section,
  .achievements-section {
    padding: 0 var(--spacing-xl);
  }

  .actions-section {
    padding: 0 var(--spacing-xl);
  }
}
</style>
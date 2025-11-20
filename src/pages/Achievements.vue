<template>
  <q-page class="achievements-page">
    <div class="container q-pa-md">
      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>

      <template v-if="!loading">
        <!-- Header -->
        <div class="q-mb-lg">
          <h1 class="text-h4 text-weight-bold text-grey-9 q-mb-xs row items-center">
            <q-icon name="emoji_events" color="amber-7" size="32px" class="q-mr-sm" />
            Conquistas
          </h1>
          <p class="text-body1 text-grey-7">
            Desbloqueie conquistas completando desafios
          </p>
        </div>

        <!-- Progress Card -->
        <q-card class="progress-card q-mb-lg">
          <q-card-section class="q-pa-lg">
            <div class="row items-center justify-between q-mb-md">
              <div>
                <div class="text-caption text-white-7 q-mb-xs">Progresso Total</div>
                <div class="text-h3 text-white text-weight-bold">
                  {{ unlockedCount }} / {{ totalCount }}
                </div>
              </div>
              <div class="progress-icon">
                <q-icon name="emoji_events" size="40px" color="white" />
              </div>
            </div>
            
            <q-linear-progress
              :value="progressPercentage / 100"
              color="white"
              track-color="white-3"
              size="12px"
              rounded
              class="q-mb-sm"
            />
            
            <div class="text-caption text-white-7">
              {{ progressPercentage }}% Completo
            </div>
          </q-card-section>
        </q-card>

        <!-- Achievements Grid -->
        <div v-if="achievements.length === 0" class="text-center q-pa-xl">
          <q-icon name="auto_awesome" size="64px" color="purple-7" class="q-mb-md" />
          <h3 class="text-h6 text-weight-bold text-grey-9 q-mb-sm">
            Nenhuma conquista disponível ainda
          </h3>
          <p class="text-body2 text-grey-7">
            As conquistas aparecerão aqui assim que forem criadas
          </p>
        </div>
        
        <div v-else class="achievements-grid">
          <achievement-badge
            v-for="achievement in achievements"
            :key="achievement.id"
            :achievement="achievement"
            :unlocked="isUnlocked(achievement.id)"
          />
        </div>
      </template>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/auth.service';
import userService from '../services/user.service';
import achievementsService from '../services/achievements.service';
import AchievementBadge from '../components/AchievementBadge.vue';

export default {
  name: 'AchievementsPage',
  
  components: {
    AchievementBadge
  },
  
  setup() {
    const router = useRouter();
    const loading = ref(true);
    const achievements = ref([]);
    const progress = ref(null);
    
    const unlockedCount = computed(() => {
      return progress.value?.achievementsUnlocked?.length || 0;
    });
    
    const totalCount = computed(() => {
      return achievements.value.length;
    });
    
    const progressPercentage = computed(() => {
      if (totalCount.value === 0) return 0;
      return Math.round((unlockedCount.value / totalCount.value) * 100);
    });
    
    const isUnlocked = (achievementId) => {
      return progress.value?.achievementsUnlocked?.includes(achievementId) || false;
    };
    
    onMounted(async () => {
      try {
        // Verifica autenticação
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
          router.push('/auth/login');
          return;
        }
        
        // Carrega progresso do usuário
        const userProgress = await userService.getUserProgress(currentUser.uid);
        progress.value = userProgress;
        
        // Carrega conquistas
        const data = await achievementsService.getAllAchievements();
        achievements.value = data;
      } catch (error) {
        console.error('Erro ao carregar conquistas:', error);
      } finally {
        loading.value = false;
      }
    });
    
    return {
      loading,
      achievements,
      progress,
      unlockedCount,
      totalCount,
      progressPercentage,
      isUnlocked
    };
  }
};
</script>

<style scoped lang="scss">
.achievements-page {
  background: linear-gradient(135deg, #faf5ff 0%, #eff6ff 50%, #fef3c7 100%);
  min-height: 100vh;
  padding-bottom: 80px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.progress-card {
  background: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%);
  border: none;
  box-shadow: 0 10px 40px rgba(147, 51, 234, 0.3);
  border-radius: 16px;
}

.progress-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-white-7 {
  color: rgba(255, 255, 255, 0.7);
}

.text-white-3 {
  color: rgba(255, 255, 255, 0.3);
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

@media (max-width: 600px) {
  .achievements-grid {
    grid-template-columns: 1fr;
  }
}
</style>
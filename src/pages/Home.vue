<template>
  <div class="home-page q-pa-md">
    <!-- Loading Overlay -->
    <div v-if="loading" class="absolute-full flex flex-center">
      <q-spinner-gears size="50px" color="primary" />
    </div>

    <template v-else>
      <!-- Header -->
      <div class="row items-center q-gutter-md q-mb-lg">
        <q-avatar size="48px" color="primary" text-color="white">
          {{ userInitial }}
        </q-avatar>
        <div>
          <h1 class="text-h5 text-weight-bold text-grey-9 q-ma-none">
            Olá, {{ userName }}!
          </h1>
          <p class="text-body2 text-grey-7 q-ma-none">
            Continue sua jornada bíblica
          </p>
        </div>
      </div>

      <!-- Level Progress -->
      <level-progress
        v-if="progress"
        :level="currentLevel"
        :current-x-p="currentXP"
        :next-level-x-p="nextLevelXP"
        class="q-mb-md"
      />

      <!-- Play Button -->
      <q-btn
        to="/quiz"
        color="primary"
        size="xl"
        unelevated
        no-caps
        class="full-width play-btn q-mb-md"
      >
        <q-icon name="play_circle" size="32px" class="q-mr-sm" />
        <span class="text-h6">Começar Quiz</span>
      </q-btn>

      <!-- Stats Grid -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-6">
          <stat-card
            icon="check_circle"
            label="Precisão"
            :value="`${accuracy}%`"
            gradient="linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
          />
        </div>
        <div class="col-6">
          <stat-card
            icon="emoji_events"
            label="Acertos"
            :value="progress?.correctAnswers || 0"
            gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
          />
        </div>
        <div class="col-6">
          <stat-card
            icon="local_fire_department"
            label="Sequência"
            :value="`${progress?.currentStreak || 0} dias`"
            gradient="linear-gradient(135deg, #f97316 0%, #dc2626 100%)"
          />
        </div>
        <div class="col-6">
          <stat-card
            icon="menu_book"
            label="Perguntas"
            :value="progress?.questionsAnswered || 0"
            gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
          />
        </div>
      </div>

      <!-- Quick Stats -->
      <q-card class="stats-card">
        <q-card-section class="q-pa-lg">
          <h2 class="text-h6 text-weight-bold text-grey-9 q-mb-md row items-center">
            <q-icon name="trending_up" color="purple-7" size="24px" class="q-mr-sm" />
            Estatísticas Rápidas
          </h2>

          <q-list separator>
            <q-item>
              <q-item-section>
                <q-item-label>Total de Perguntas no App</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label class="text-weight-bold">{{ totalQuestions }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label>Melhor Sequência</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label class="text-weight-bold text-orange-6">
                  {{ progress?.bestStreak || 0 }} dias
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label>Conquistas Desbloqueadas</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label class="text-weight-bold text-purple-7">
                  {{ progress?.achievementsUnlocked?.length || 0 }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label>XP Total</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label class="text-weight-bold text-amber-7 row items-center">
                  <q-icon name="bolt" size="16px" class="q-mr-xs" />
                  {{ progress?.totalXp || 0 }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/auth.service';
import quizService from '../services/quiz.service';
import userService from '../services/user.service'; // ✅ Import direto (não dinâmico)
import LevelProgress from '../components/LevelProgress.vue';
import StatCard from '../components/StatCard.vue';

export default {
  name: 'HomePage',

  components: {
    LevelProgress,
    StatCard
  },

  setup() {
    const router = useRouter();
    const loading = ref(true);
    const totalQuestions = ref(0);
    const user = ref(null);
    const progress = ref(null);

    const userName = computed(() => {
      return user.value?.displayName?.split(' ')[0] || 'Jogador';
    });

    const userInitial = computed(() => {
      return user.value?.displayName?.charAt(0).toUpperCase() || 'U';
    });

    const currentLevel = computed(() => progress.value?.level || 1);

    const currentXP = computed(() => {
      if (!progress.value) return 0;
      const next = nextLevelXP.value;
      return progress.value.totalXp % next;
    });

    const nextLevelXP = computed(() => {
      if (!progress.value) return 100;
      return progress.value.level * 100;
    });

    const accuracy = computed(() => {
      if (!progress.value || progress.value.questionsAnswered === 0) return 0;
      return Math.round((progress.value.correctAnswers / progress.value.questionsAnswered) * 100);
    });

    let unsubscribeAuth = null;

    onMounted(async () => {
      // ✅ Inscreve no estado de autenticação
      unsubscribeAuth = authService.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          try {
            console.log('✅ Usuário autenticado:', firebaseUser.uid);

            // ✅ Usa userService importado diretamente
            const userInfo = await userService.getUser(firebaseUser.uid);
            const userProgressData = await userService.getUserProgress(firebaseUser.uid);

            user.value = userInfo;
            progress.value = userProgressData;

            console.log('✅ Dados do usuário carregados');
          } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
          }
        } else {
          // ✅ Redirecionamento mantido (mas ideal: mover para router guard)
          console.warn('⚠️ Usuário não autenticado — redirecionando para login');
          router.push('/auth/login');
        }
      });

      // Carrega total de perguntas em paralelo
      try {
        const questions = await quizService.getAllQuestions();
        totalQuestions.value = questions.length;
      } catch (error) {
        console.error('Erro ao carregar perguntas:', error);
      } finally {
        loading.value = false;
      }
    });

    onUnmounted(() => {
      // ✅ Evita vazamento de memória
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
    });

    return {
      loading,
      progress,
      user,
      userName,
      userInitial,
      totalQuestions,
      currentLevel,
      currentXP,
      nextLevelXP,
      accuracy
    };
  }
};
</script>

<style scoped lang="scss">
.home-page {
  background: linear-gradient(135deg, #faf5ff 0%, #eff6ff 50%, #fef3c7 100%);
  min-height: calc(100vh - 144px); // header (64px) + bottom-nav (80px)
  position: relative;
}

.play-btn {
  border-radius: 16px;
  height: 80px;
  background: linear-gradient(135deg, #9333ea 0%, #3b82f6 50%, #9333ea 100%);
  box-shadow: 0 8px 32px rgba(147, 51, 234, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(147, 51, 234, 0.4);
  }
}

.stats-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border-radius: 16px;
}
</style>
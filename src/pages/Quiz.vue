<template>
  <q-page class="quiz-page">
    <div class="container q-pa-md">
      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="primary" />
        <div class="text-center text-grey-7 q-mt-md">Preparando perguntas...</div>
      </q-inner-loading>

      <template v-if="!loading && !quizComplete">
        <!-- Header -->
        <div class="row items-center justify-between q-mb-lg">
          <q-btn
            flat
            round
            icon="arrow_back"
            color="grey-8"
            to="/"
          />
          
          <div class="row q-gutter-sm">
            <q-chip color="white" text-color="grey-9" icon="emoji_events">
              {{ score }}
            </q-chip>
            <q-chip color="white" text-color="grey-9" icon="bolt">
              {{ xpEarned }} XP
            </q-chip>
          </div>
        </div>

        <!-- Question -->
        <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
          mode="out-in"
        >
          <question-card
            v-if="currentQuestion"
            :key="currentQuestionIndex"
            :question="currentQuestion"
            :question-number="currentQuestionIndex + 1"
            :total-questions="questions.length"
            @answer="handleAnswer"
          />
        </transition>
      </template>

      <!-- Quiz Complete -->
      <template v-if="quizComplete">
        <div class="complete-container">
          <q-card class="complete-card">
            <q-card-section class="text-center q-pa-xl">
              <div class="trophy-icon q-mb-lg">
                <q-icon name="emoji_events" size="80px" color="white" />
              </div>
              
              <h1 class="text-h4 text-weight-bold text-grey-9 q-mb-sm">
                Quiz Concluído!
              </h1>
              <p class="text-body1 text-grey-7 q-mb-xl">
                Parabéns por completar o desafio
              </p>
              
              <div class="score-box q-mb-lg">
                <div class="text-caption text-grey-7 q-mb-xs">Pontuação</div>
                <div class="text-h3 text-weight-bold text-purple-7">
                  {{ score }} / {{ questions.length }}
                </div>
              </div>
              
              <div class="row q-col-gutter-md q-mb-xl">
                <div class="col-6">
                  <div class="metric-box accuracy">
                    <q-icon name="check_circle" size="32px" class="q-mb-sm" />
                    <div class="text-caption">Precisão</div>
                    <div class="text-h5 text-weight-bold">{{ accuracy }}%</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="metric-box xp">
                    <q-icon name="bolt" size="32px" class="q-mb-sm" />
                    <div class="text-caption">XP Ganho</div>
                    <div class="text-h5 text-weight-bold">+{{ xpEarned }}</div>
                  </div>
                </div>
              </div>
              
              <div class="q-gutter-md">
                <q-btn
                  to="/"
                  color="primary"
                  size="lg"
                  unelevated
                  no-caps
                  class="full-width"
                  style="height: 56px; font-size: 18px;"
                >
                  Voltar ao Início
                </q-btn>
                
                <q-btn
                  outline
                  color="primary"
                  size="lg"
                  no-caps
                  class="full-width"
                  style="height: 56px; font-size: 18px;"
                  @click="restartQuiz"
                >
                  <q-icon name="auto_awesome" size="20px" class="q-mr-sm" />
                  Jogar Novamente
                </q-btn>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import authService from '../services/auth.service';
import userService from '../services/user.service';
import quizService from '../services/quiz.service';
import achievementsService from '../services/achievements.service';
import QuestionCard from '../components/QuestionCard.vue';
import confetti from 'canvas-confetti';

export default {
  name: 'QuizPage',
  
  components: {
    QuestionCard
  },
  
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    
    const loading = ref(true);
    const questions = ref([]);
    const currentQuestionIndex = ref(0);
    const score = ref(0);
    const xpEarned = ref(0);
    const quizComplete = ref(false);
    const progress = ref(null);
    
    const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);
    
    const accuracy = computed(() => {
      if (questions.value.length === 0) return 0;
      return Math.round((score.value / questions.value.length) * 100);
    });
    
    const loadQuiz = async () => {
      try {
        // Verifica autenticação
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
          router.push('/auth/login');
          return;
        }
        
        loading.value = true;
        
        // Carrega progresso do usuário
        const userProgress = await userService.getUserProgress(currentUser.uid);
        progress.value = userProgress;
        
        const quizQuestions = await quizService.getRandomQuestions(10);
        questions.value = quizQuestions;
      } catch (error) {
        console.error('Erro ao carregar quiz:', error);
        $q.notify({
          type: 'negative',
          message: 'Erro ao carregar perguntas'
        });
      } finally {
        loading.value = false;
      }
    };
    
    const handleAnswer = async (isCorrect, selectedOption) => {
      if (isCorrect) {
        score.value++;
        const xp = quizService.calculateXP(currentQuestion.value.difficulty);
        xpEarned.value += xp;
      }
      
      if (currentQuestionIndex.value < questions.value.length - 1) {
        currentQuestionIndex.value++;
      } else {
        await completeQuiz();
      }
    };
    
    const completeQuiz = async () => {
      quizComplete.value = true;
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      try {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) return;
        
        const currentProgress = progress.value;
        const newTotalXP = currentProgress.totalXp + xpEarned.value;
        const newLevel = quizService.calculateLevel(newTotalXP);
        
        const today = new Date().toISOString().split('T')[0];
        const lastPlayed = currentProgress.lastPlayed;
        let newStreak = currentProgress.currentStreak;
        
        if (lastPlayed) {
          const lastDate = new Date(lastPlayed);
          const todayDate = new Date(today);
          const diffTime = todayDate - lastDate;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }
        
        const updatedProgress = {
          totalXp: newTotalXP,
          level: newLevel,
          questionsAnswered: currentProgress.questionsAnswered + questions.value.length,
          correctAnswers: currentProgress.correctAnswers + score.value,
          currentStreak: newStreak,
          bestStreak: Math.max(currentProgress.bestStreak, newStreak),
          lastPlayed: today
        };
        
        await userService.updateUserProgress(currentUser.uid, updatedProgress);
        progress.value = { ...currentProgress, ...updatedProgress };
        
        if (newLevel > currentProgress.level) {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.5 }
          });
          
          $q.notify({
            type: 'positive',
            message: `🎉 Parabéns! Você subiu para o nível ${newLevel}!`,
            timeout: 3000
          });
        }
        
        // Check achievements
        const achievements = await achievementsService.getAllAchievements();
        const newUnlocked = achievementsService.checkAchievements(
          { ...currentProgress, totalXp: newTotalXP, level: newLevel },
          achievements
        );
        
        if (newUnlocked.length > 0) {
          const updatedAchievements = [...currentProgress.achievementsUnlocked, ...newUnlocked];
          await userService.updateUserProgress(currentUser.uid, {
            achievementsUnlocked: updatedAchievements
          });
          
          progress.value = { ...progress.value, achievementsUnlocked: updatedAchievements };
          
          $q.notify({
            type: 'positive',
            message: `🏆 Nova conquista desbloqueada!`,
            timeout: 3000
          });
        }
      } catch (error) {
        console.error('Erro ao salvar progresso:', error);
      }
    };
    
    const restartQuiz = () => {
      currentQuestionIndex.value = 0;
      score.value = 0;
      xpEarned.value = 0;
      quizComplete.value = false;
      loadQuiz();
    };
    
    onMounted(() => {
      loadQuiz();
    });
    
    return {
      loading,
      questions,
      currentQuestionIndex,
      currentQuestion,
      score,
      xpEarned,
      quizComplete,
      accuracy,
      handleAnswer,
      restartQuiz
    };
  }
};
</script>

<style scoped lang="scss">
.quiz-page {
  background: linear-gradient(135deg, #faf5ff 0%, #eff6ff 50%, #fef3c7 100%);
  min-height: 100vh;
  padding-bottom: 80px;
}

.container {
  max-width: 768px;
  margin: 0 auto;
}

.complete-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.complete-card {
  border: none;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border-radius: 24px;
  max-width: 500px;
  width: 100%;
}

.trophy-icon {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.score-box {
  padding: 24px;
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
  border-radius: 16px;
}

.metric-box {
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  
  &.accuracy {
    background: rgba(34, 197, 94, 0.1);
    color: #16a34a;
  }
  
  &.xp {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
  }
}
</style>
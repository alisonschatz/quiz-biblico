<template>
  <div class="quiz-page">
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p class="loading-text">Preparando perguntas...</p>
      </div>
    </div>

    <div v-else-if="!quizComplete" class="quiz-container">
      <header class="quiz-header">
        <button class="header-btn back-button" @click="goBack">
          <ArrowLeftIcon class="btn-icon" />
        </button>
        <div class="header-stats">
          <div class="stat-chip stat-score">
            <TrophyIcon class="chip-icon" />
            <span class="chip-value">{{ score }}</span>
          </div>
          <div class="stat-chip stat-xp">
            <BoltIcon class="chip-icon" />
            <span class="chip-value">{{ xpEarned }}</span>
          </div>
        </div>
      </header>

      <div class="progress-section">
        <div class="progress-info">
          <span class="progress-label">Questão {{ currentQuestionIndex + 1 }} de {{ questions.length }}</span>
          <span class="progress-percentage">{{ progressPercentage }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
        </div>
      </div>

      <transition name="question-slide" mode="out-in">
        <div
          v-if="currentQuestion"
          :key="currentQuestionIndex"
          class="question-section"
        >
          <div class="question-card">
            <div class="difficulty-badge" :class="`difficulty-${currentQuestion.difficulty}`">
              <SparklesIcon class="difficulty-icon" />
              <span>{{ difficultyLabel }}</span>
            </div>

            <h2 class="question-text">{{ currentQuestion.question }}</h2>

            <div class="options-list">
              <button
                v-for="(option, index) in currentQuestion.options"
                :key="index"
                :class="[
                  'option-button',
                  {
                    selected: selectedOption === index,
                    correct: showResult && index === currentQuestion.correctAnswer,
                    incorrect: showResult && selectedOption === index && index !== currentQuestion.correctAnswer,
                    disabled: showResult
                  }
                ]"
                @click="selectOption(index)"
                :disabled="showResult"
              >
                <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
                <span class="option-text">{{ option }}</span>
                <transition name="icon-pop">
                  <CheckCircleIcon
                    v-if="showResult && index === currentQuestion.correctAnswer"
                    class="result-icon icon-correct"
                  />
                  <XCircleIcon
                    v-else-if="showResult && selectedOption === index && index !== currentQuestion.correctAnswer"
                    class="result-icon icon-incorrect"
                  />
                </transition>
              </button>
            </div>

            <button
              v-if="!showResult"
              class="action-btn confirm-btn"
              :disabled="selectedOption === null || isProcessing"
              @click="confirmAnswer"
            >
              <span>{{ isProcessing ? 'Processando...' : 'Confirmar Resposta' }}</span>
              <ArrowRightIcon v-if="!isProcessing" class="btn-icon" />
              <div v-else class="btn-spinner"></div>
            </button>
          </div>
        </div>
      </transition>
    </div>

    <div v-else class="complete-container">
      <div class="complete-card">
        <div class="complete-content">
          <div class="trophy-wrapper">
            <div class="trophy-circle">
              <TrophyIcon class="trophy-icon" />
            </div>
            <div class="trophy-glow"></div>
          </div>
          <h1 class="complete-title">Quiz Concluído!</h1>
          <p class="complete-subtitle">Parabéns por completar o desafio</p>

          <div class="score-display">
            <span class="score-label">Pontuação</span>
            <span class="score-value">{{ score }} / {{ questions.length }}</span>
          </div>

          <div class="metrics-grid">
            <div class="metric-card metric-accuracy">
              <div class="metric-icon-box">
                <CheckCircleIcon class="metric-icon" />
              </div>
              <div class="metric-info">
                <span class="metric-label">Precisão</span>
                <span class="metric-value">{{ accuracy }}%</span>
              </div>
            </div>
            <div class="metric-card metric-xp">
              <div class="metric-icon-box">
                <BoltIcon class="metric-icon" />
              </div>
              <div class="metric-info">
                <span class="metric-label">XP Ganho</span>
                <span class="metric-value">+{{ xpEarned }}</span>
              </div>
            </div>
            <div class="metric-card metric-time">
              <div class="metric-icon-box">
                <ClockIcon class="metric-icon" />
              </div>
              <div class="metric-info">
                <span class="metric-label">Tempo</span>
                <span class="metric-value">{{ formattedTime }}</span>
              </div>
            </div>
            <div class="metric-card metric-streak">
              <div class="metric-icon-box">
                <FireIcon class="metric-icon" />
              </div>
              <div class="metric-info">
                <span class="metric-label">Sequência</span>
                <span class="metric-value">{{ currentStreak }}</span>
              </div>
            </div>
          </div>

          <div class="actions-wrapper">
            <button class="action-btn primary-action" @click="goHome">
              <HomeIcon class="action-icon" /> Voltar ao Início
            </button>
            <button class="action-btn secondary-action" @click="restartQuiz">
              <ArrowPathIcon class="action-icon" /> Jogar Novamente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Snackbar -->
    <transition name="snackbar-slide">
      <div v-if="snackbar.show" :class="['snackbar', `snackbar-${snackbar.type}`]">
        <component :is="snackbar.icon" class="snackbar-icon" />
        <span class="snackbar-message">{{ snackbar.message }}</span>
        <button class="snackbar-close" @click="hideSnackbar">×</button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import authService from '/src/services/auth.service';
import userService from '/src/services/user.service';
import quizService from '/src/services/quiz.service';
import achievementsService from '/src/services/achievements.service';
import confetti from 'canvas-confetti';

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  TrophyIcon,
  BoltIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  ExclamationCircleIcon,
  ClockIcon,
  FireIcon,
  HomeIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/solid';

const router = useRouter();

const loading = ref(true);
const questions = ref([]);
const currentQuestionIndex = ref(0);
const score = ref(0);
const xpEarned = ref(0);
const quizComplete = ref(false);
const progress = ref(null);
const selectedOption = ref(null);
const showResult = ref(false);
const isProcessing = ref(false);
const startTime = ref(null);
const elapsedTime = ref(0);
const timerInterval = ref(null);
const currentStreak = ref(0);

const snackbar = ref({
  show: false,
  message: '',
  type: 'success',
  icon: CheckCircleIcon
});

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);
const progressPercentage = computed(() =>
  questions.value.length ? Math.round(((currentQuestionIndex.value + 1) / questions.value.length) * 100) : 0
);
const accuracy = computed(() =>
  questions.value.length ? Math.round((score.value / questions.value.length) * 100) : 0
);
const difficultyLabel = computed(() =>
  ({ easy: 'Fácil', medium: 'Médio', hard: 'Difícil' }[currentQuestion.value?.difficulty] || 'Médio')
);
const isLastQuestion = computed(() => currentQuestionIndex.value === questions.value.length - 1);
const formattedTime = computed(() => {
  const mins = Math.floor(elapsedTime.value / 60);
  const secs = elapsedTime.value % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
});

const showSnackbar = (message, type = 'success') => {
  const icons = { success: CheckCircleIcon, error: ExclamationCircleIcon, info: CheckCircleIcon };
  snackbar.value = { show: true, message, type, icon: icons[type] ?? CheckCircleIcon };
  setTimeout(hideSnackbar, 3000);
};

const hideSnackbar = () => (snackbar.value.show = false);

const startTimer = () => {
  startTime.value = Date.now();
  timerInterval.value = setInterval(() => {
    elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000);
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval.value) clearInterval(timerInterval.value);
  timerInterval.value = null;
};

const loadQuiz = async () => {
  try {
    const user = authService.getCurrentUser();
    if (!user) return router.push('/auth/login');

    loading.value = true;

    const userProgress = await userService.getUserProgress(user.uid);
    progress.value = userProgress;
    currentStreak.value = userProgress.currentStreak || 0;

    questions.value = await quizService.getRandomQuestions(10);
    startTimer();
  } catch (error) {
    console.error('Erro ao carregar quiz:', error);
    showSnackbar('Erro ao carregar perguntas', 'error');
  } finally {
    loading.value = false;
  }
};

const selectOption = (index) => {
  if (!showResult.value) selectedOption.value = index;
};

const confirmAnswer = () => {
  if (selectedOption.value === null || showResult.value || isProcessing.value) return;

  isProcessing.value = true;
  showResult.value = true;
  const correct = selectedOption.value === currentQuestion.value.correctAnswer;

  if (correct) {
    score.value++;
    const xp = quizService.calculateXP(currentQuestion.value.difficulty);
    xpEarned.value += xp;
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  }

  setTimeout(() => {
    isProcessing.value = false;
    if (isLastQuestion.value) {
      completeQuiz();
    } else {
      currentQuestionIndex.value++;
      selectedOption.value = null;
      showResult.value = false;
    }
  }, 1500);
};

const completeQuiz = async () => {
  stopTimer();
  quizComplete.value = true;
  confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });

  try {
    const user = authService.getCurrentUser();
    if (!user) return;

    const p = progress.value;
    const newTotalXP = p.totalXp + xpEarned.value;
    const newLevel = quizService.calculateLevel(newTotalXP);
    const today = new Date().toISOString().split('T')[0];
    const lastPlayed = p.lastPlayed;
    let newStreak = p.currentStreak || 1;

    if (lastPlayed) {
      const diffDays = Math.floor((new Date(today) - new Date(lastPlayed)) / 864e5);
      newStreak = diffDays === 1 ? p.currentStreak + 1 : diffDays > 1 ? 1 : p.currentStreak;
    }

    currentStreak.value = newStreak;
    const updated = {
      totalXp: newTotalXP,
      level: newLevel,
      questionsAnswered: p.questionsAnswered + questions.value.length,
      correctAnswers: p.correctAnswers + score.value,
      currentStreak: newStreak,
      bestStreak: Math.max(p.bestStreak, newStreak),
      lastPlayed: today
    };

    await userService.updateUserProgress(user.uid, updated);
    progress.value = { ...p, ...updated };

    if (newLevel > p.level) {
      confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 } });
      showSnackbar(`🎉 Parabéns! Você subiu para o nível ${newLevel}!`, 'success');
    }

    const achievements = await achievementsService.getAllAchievements();
    const newUnlocked = achievementsService.checkAchievements(
      { ...p, totalXp: newTotalXP, level: newLevel },
      achievements
    );

    if (newUnlocked.length) {
      const updatedAchievements = [...p.achievementsUnlocked, ...newUnlocked];
      await userService.updateUserProgress(user.uid, { achievementsUnlocked: updatedAchievements });
      progress.value = { ...progress.value, achievementsUnlocked: updatedAchievements };
      showSnackbar('🏆 Nova conquista desbloqueada!', 'success');
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
  selectedOption.value = null;
  showResult.value = false;
  isProcessing.value = false;
  elapsedTime.value = 0;
  loadQuiz();
};

const goBack = () => {
  stopTimer();
  router.push('/');
};

const goHome = () => router.push('/');

onMounted(() => loadQuiz());
onUnmounted(() => stopTimer());
</script>

<style src="/src/css/pages/quiz.scss" scoped></style>
<template>
  <div class="quiz-page">
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p class="loading-text">Preparando perguntas...</p>
      </div>
    </div>

    <div v-else-if="!quizStore.quizComplete" class="quiz-container">
      <header class="quiz-header">
        <button class="header-btn back-button" @click="goBack">
          <ArrowLeftIcon class="btn-icon" />
        </button>
        <div class="header-stats">
          <div class="stat-chip stat-score">
            <TrophyIcon class="chip-icon" />
            <span class="chip-value">{{ quizStore.score }}</span>
          </div>
          <div class="stat-chip stat-xp">
            <BoltIcon class="chip-icon" />
            <span class="chip-value">{{ quizStore.xpEarned }}</span>
          </div>
        </div>
      </header>

      <div class="progress-section">
        <div class="progress-info">
          <span class="progress-label">Questão {{ quizStore.currentQuestionIndex + 1 }} de {{ quizStore.questions.length }}</span>
          <span class="progress-percentage">{{ quizStore.progressPercentage }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${quizStore.progressPercentage}%` }"></div>
        </div>
      </div>

      <transition name="question-slide" mode="out-in">
        <div
          v-if="quizStore.currentQuestion"
          :key="quizStore.currentQuestionIndex"
          class="question-section"
        >
          <div class="question-card">
            <div class="question-meta">
              <div class="difficulty-badge" :class="`difficulty-${quizStore.difficultyClass}`">
                <SparklesIcon class="difficulty-icon" />
                <span>{{ quizStore.difficultyLabel }}</span>
              </div>
              <div class="category-badge">
                <TagIcon class="category-icon" />
                <span>{{ quizStore.categoryLabel }}</span>
              </div>
            </div>

            <h2 class="question-text">{{ quizStore.currentQuestion.question }}</h2>

            <div class="options-list">
              <button
                v-for="(option, index) in quizStore.currentQuestion.options"
                :key="index"
                :class="[
                  'option-button',
                  {
                    selected: quizStore.selectedOption === index,
                    correct: quizStore.showResult && index === quizStore.currentQuestion.correctAnswer,
                    incorrect: quizStore.showResult && quizStore.selectedOption === index && index !== quizStore.currentQuestion.correctAnswer,
                    disabled: quizStore.showResult
                  }
                ]"
                @click="quizStore.selectOption(index)"
                :disabled="quizStore.showResult"
              >
                <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
                <span class="option-text">{{ option }}</span>
                <transition name="icon-pop">
                  <CheckCircleIcon
                    v-if="quizStore.showResult && index === quizStore.currentQuestion.correctAnswer"
                    class="result-icon icon-correct"
                  />
                  <XCircleIcon
                    v-else-if="quizStore.showResult && quizStore.selectedOption === index && index !== quizStore.currentQuestion.correctAnswer"
                    class="result-icon icon-incorrect"
                  />
                </transition>
              </button>
            </div>

            <button
              v-if="!quizStore.showResult"
              class="action-btn confirm-btn"
              :disabled="quizStore.selectedOption === null || quizStore.isProcessing"
              @click="confirmAnswer"
            >
              <span>{{ quizStore.isProcessing ? 'Processando...' : 'Confirmar Resposta' }}</span>
              <ArrowRightIcon v-if="!quizStore.isProcessing" class="btn-icon" />
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
            <span class="score-value">{{ quizStore.score }} / {{ quizStore.questions.length }}</span>
          </div>

          <div class="metrics-grid">
            <div class="metric-card metric-accuracy">
              <div class="metric-icon-box">
                <CheckCircleIcon class="metric-icon" />
              </div>
              <div class="metric-info">
                <span class="metric-label">Precisão</span>
                <span class="metric-value">{{ quizStore.accuracy }}%</span>
              </div>
            </div>
            <div class="metric-card metric-xp">
              <div class="metric-icon-box">
                <BoltIcon class="metric-icon" />
              </div>
              <div class="metric-info">
                <span class="metric-label">XP Ganho</span>
                <span class="metric-value">+{{ quizStore.xpEarned }}</span>
              </div>
            </div>
            <div class="metric-card metric-time">
              <div class="metric-icon-box">
                <ClockIcon class="metric-icon" />
              </div>
              <div class="metric-info">
                <span class="metric-label">Tempo</span>
                <span class="metric-value">{{ quizStore.formattedTime }}</span>
              </div>
            </div>
            <div class="metric-card metric-streak">
              <div class="metric-icon-box">
                <FireIcon class="metric-icon" />
              </div>
              <div class="metric-info">
                <span class="metric-label">Sequência</span>
                <span class="metric-value">{{ quizStore.currentStreak }}</span>
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuizStore } from '../stores/quiz.store';
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
  ArrowPathIcon,
  TagIcon
} from '@heroicons/vue/24/solid';

const router = useRouter();
const quizStore = useQuizStore();

const loading = ref(true);
const progress = ref(null);

const snackbar = ref({
  show: false,
  message: '',
  type: 'success',
  icon: CheckCircleIcon
});

const showSnackbar = (message, type = 'success') => {
  const icons = { success: CheckCircleIcon, error: ExclamationCircleIcon, info: CheckCircleIcon };
  snackbar.value = { show: true, message, type, icon: icons[type] ?? CheckCircleIcon };
  setTimeout(hideSnackbar, 3000);
};

const hideSnackbar = () => (snackbar.value.show = false);

const loadQuiz = async () => {
  try {
    const user = authService.getCurrentUser();
    if (!user) return router.push('/auth');

    loading.value = true;

    const userProgress = await userService.getUserProgress(user.uid);
    progress.value = userProgress;
    quizStore.setCurrentStreak(userProgress.currentStreak || 0);

    const questions = await quizService.getRandomQuestions(10);
    quizStore.setQuestions(questions);
    quizStore.startTimer();
  } catch (error) {
    console.error('Erro ao carregar quiz:', error);
    showSnackbar('Erro ao carregar perguntas', 'error');
  } finally {
    loading.value = false;
  }
};

const confirmAnswer = () => {
  if (quizStore.selectedOption === null || quizStore.showResult || quizStore.isProcessing) return;

  quizStore.startProcessing();
  const correct = quizStore.selectedOption === quizStore.currentQuestion.correctAnswer;

  if (correct) {
    const xp = quizService.calculateXP(quizStore.currentQuestion.difficulty);
    quizStore.answerCorrect(xp);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  }

  setTimeout(() => {
    quizStore.finishProcessing();
    if (quizStore.isLastQuestion) {
      completeQuiz();
    } else {
      quizStore.nextQuestion();
    }
  }, 1500);
};

const completeQuiz = async () => {
  quizStore.completeQuiz();
  confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });

  try {
    const user = authService.getCurrentUser();
    if (!user) return;

    const p = progress.value;
    const newTotalXP = p.totalXp + quizStore.xpEarned;
    const newLevel = quizService.calculateLevel(newTotalXP);
    const today = new Date().toISOString().split('T')[0];
    const lastPlayed = p.lastPlayed;
    let newStreak = p.currentStreak || 1;

    if (lastPlayed) {
      const diffDays = Math.floor((new Date(today) - new Date(lastPlayed)) / 864e5);
      newStreak = diffDays === 1 ? p.currentStreak + 1 : diffDays > 1 ? 1 : p.currentStreak;
    }

    quizStore.setCurrentStreak(newStreak);
    const updated = {
      totalXp: newTotalXP,
      level: newLevel,
      questionsAnswered: p.questionsAnswered + quizStore.questions.length,
      correctAnswers: p.correctAnswers + quizStore.score,
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
  quizStore.resetQuiz();
  loadQuiz();
};

const goBack = () => {
  quizStore.stopTimer();
  router.push('/');
};

const goHome = () => router.push('/');

onMounted(() => loadQuiz());
onUnmounted(() => quizStore.stopTimer());
</script>

<style src="/src/css/pages/quiz.scss" scoped></style>
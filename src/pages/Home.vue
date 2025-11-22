<template>
  <div class="home-page">
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>

    <div v-else class="home-container">
      <section class="welcome-section">
        <div class="welcome-header">
          <div class="user-avatar-small">
            <img
              v-if="authStore.userPhotoURL"
              :src="authStore.userPhotoURL"
              :alt="userName"
              class="avatar-img"
            />
            <UserIcon v-else class="avatar-icon" />
          </div>
          <div class="welcome-info">
            <h1 class="welcome-title">Olá, {{ userName }}!</h1>
            <p class="welcome-subtitle">Continue sua jornada bíblica</p>
          </div>
        </div>
      </section>

      <section v-if="authStore.userProgress" class="level-card">
        <div class="level-header">
          <div class="level-badge">
            <StarIcon class="level-star" />
            <span class="level-number">Nível {{ level }}</span>
          </div>
          <span class="level-xp">{{ xp }} / {{ xpToNextLevel }} XP</span>
        </div>
        <div class="level-progress-bar">
          <div class="level-progress-fill" :style="{ width: `${xpPercentage}%` }"></div>
        </div>
      </section>

      <button class="action-button" @click="goToQuiz">
        <div class="action-icon-wrapper">
          <PlayCircleIcon class="action-icon" />
        </div>
        <div class="action-content">
          <span class="action-title">Começar Quiz</span>
          <span class="action-subtitle">Teste seus conhecimentos bíblicos</span>
        </div>
        <ArrowRightIcon class="action-arrow" />
      </button>

      <section class="stats-overview">
        <h2 class="section-title">
          <ChartBarIcon class="title-icon" />
          Suas Estatísticas
        </h2>
        <div class="stats-grid">
          <div class="stat-item stat-success">
            <div class="stat-icon-box">
              <CheckCircleIcon class="stat-icon" />
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ accuracy }}%</span>
              <span class="stat-label">Precisão</span>
            </div>
          </div>
          <div class="stat-item stat-primary">
            <div class="stat-icon-box">
              <TrophyIcon class="stat-icon" />
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ correctAnswers }}</span>
              <span class="stat-label">Acertos</span>
            </div>
          </div>
          <div class="stat-item stat-warning">
            <div class="stat-icon-box">
              <FireIcon class="stat-icon" />
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ currentStreak }}</span>
              <span class="stat-label">Sequência</span>
            </div>
          </div>
          <div class="stat-item stat-info">
            <div class="stat-icon-box">
              <BookOpenIcon class="stat-icon" />
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ questionsAnswered }}</span>
              <span class="stat-label">Perguntas</span>
            </div>
          </div>
        </div>
      </section>

      <section class="detailed-stats">
        <h2 class="section-title">
          <SparklesIcon class="title-icon" />
          Estatísticas Detalhadas
        </h2>
        <div class="details-card">
          <div class="detail-row">
            <div class="detail-left">
              <BookOpenIcon class="detail-icon" />
              <span class="detail-label">Total de Perguntas no App</span>
            </div>
            <span class="detail-value">{{ totalQuestions }}</span>
          </div>
          <div class="detail-separator"></div>
          <div class="detail-row">
            <div class="detail-left">
              <FireIcon class="detail-icon detail-icon-orange" />
              <span class="detail-label">Melhor Sequência</span>
            </div>
            <span class="detail-value detail-value-orange">
              {{ bestStreak }} dias
            </span>
          </div>
          <div class="detail-separator"></div>
          <div class="detail-row">
            <div class="detail-left">
              <ShieldCheckIcon class="detail-icon detail-icon-purple" />
              <span class="detail-label">Conquistas Desbloqueadas</span>
            </div>
            <span class="detail-value detail-value-purple">
              {{ achievementsUnlocked }}
            </span>
          </div>
          <div class="detail-separator"></div>
          <div class="detail-row">
            <div class="detail-left">
              <BoltIcon class="detail-icon detail-icon-gold" />
              <span class="detail-label">XP Total Acumulado</span>
            </div>
            <span class="detail-value detail-value-gold">
              {{ totalXp }} XP
            </span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import quizService from '/src/services/quiz.service';

import {
  UserIcon,
  StarIcon,
  PlayCircleIcon,
  ArrowRightIcon,
  ChartBarIcon,
  CheckCircleIcon,
  TrophyIcon,
  FireIcon,
  BookOpenIcon,
  SparklesIcon,
  ShieldCheckIcon,
  BoltIcon
} from '@heroicons/vue/24/solid';

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(true);
const totalQuestions = ref(0);

const userName = computed(() => {
  const displayName = authStore.userName || 'Jogador';
  return displayName.split(' ')[0];
});

const level = computed(() => {
  const progress = authStore.userProgress;
  return progress?.level ?? 1;
});

const totalXp = computed(() => {
  const progress = authStore.userProgress;
  return progress?.totalXp ?? 0;
});

const xpToNextLevel = computed(() => level.value * 100);
const xp = computed(() => totalXp.value % xpToNextLevel.value);
const xpPercentage = computed(() => Math.round((xp.value / xpToNextLevel.value) * 100));

const questionsAnswered = computed(() => {
  const progress = authStore.userProgress;
  return progress?.questionsAnswered ?? 0;
});

const correctAnswers = computed(() => {
  const progress = authStore.userProgress;
  return progress?.correctAnswers ?? 0;
});

const currentStreak = computed(() => {
  const progress = authStore.userProgress;
  return progress?.currentStreak ?? 0;
});

const bestStreak = computed(() => {
  const progress = authStore.userProgress;
  return progress?.bestStreak ?? 0;
});

const achievementsUnlocked = computed(() => {
  const progress = authStore.userProgress;
  return Array.isArray(progress?.achievementsUnlocked) ? progress.achievementsUnlocked.length : 0;
});

const accuracy = computed(() => {
  if (questionsAnswered.value === 0) return 0;
  return Math.round((correctAnswers.value / questionsAnswered.value) * 100);
});

const goToQuiz = () => router.push('/quiz');

onMounted(async () => {
  try {
    if (!authStore.isAuthenticated) {
      router.push('/auth');
      return;
    }

    const questions = await quizService.getAllQuestions();
    totalQuestions.value = questions.length;
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style src="/src/css/pages/home.scss" scoped></style>
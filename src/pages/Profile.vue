<template>
  <div class="profile-page">
    <div class="profile-container">
      <section class="banner-section">
        <div class="banner-bg">
          <div class="banner-pattern"></div>
        </div>
        
        <div class="banner-content">
          <div class="avatar-container">
            <div class="avatar-wrapper">
              <img 
                v-if="userPhotoURL" 
                :src="userPhotoURL" 
                :alt="userName"
                class="avatar-image"
              />
              <div v-else class="avatar-placeholder">
                <UserIcon class="avatar-icon" />
              </div>
            </div>
          </div>

          <div class="user-info">
            <h1 class="user-name">{{ userName }}</h1>
            <p class="user-email">{{ userEmail }}</p>
            <div class="user-level">
              <StarIcon class="level-icon" />
              <span class="level-text">Nível {{ userLevel }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="stats-section">
        <div class="stats-grid">
          <div
            v-for="stat in statsData"
            :key="stat.key"
            class="stat-card"
          >
            <div class="stat-card-content">
              <div :class="['stat-icon-box', stat.colorClass]">
                <component :is="stat.icon" class="stat-icon" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="content-section">
        <div class="section-header">
          <h2 class="section-title">
            <ChartBarIcon class="title-icon" />
            Progresso por Categoria
          </h2>
        </div>

        <div class="progress-list">
          <div
            v-for="category in categoryProgress"
            :key="category.name"
            class="progress-card"
          >
            <div class="progress-header">
              <span class="category-name">{{ category.name }}</span>
              <span class="category-percentage">{{ category.percentage }}%</span>
            </div>

            <div class="progress-track">
              <div 
                class="progress-fill"
                :style="{
                  width: `${category.percentage}%`,
                  background: category.gradient
                }"
              ></div>
            </div>

            <div class="progress-footer">
              <span class="progress-stat">
                <CheckCircleIcon class="stat-icon-sm" />
                {{ category.completed }} concluídos
              </span>
              <span class="progress-stat">
                <ClockIcon class="stat-icon-sm" />
                {{ category.remaining }} restantes
              </span>
            </div>
          </div>
        </div>
      </section>

      <section class="content-section">
        <div class="section-header">
          <h2 class="section-title">
            <TrophyIcon class="title-icon" />
            Últimas Conquistas
          </h2>
          <button class="view-all-btn" @click="navigateToAchievements">
            Ver todas
            <ArrowRightIcon class="arrow-icon" />
          </button>
        </div>

        <div class="achievements-list">
          <div
            v-for="achievement in recentAchievements"
            :key="achievement.id"
            class="achievement-card"
          >
            <div class="achievement-icon-box">
              <component :is="achievement.icon" class="achievement-icon" />
            </div>
            <div class="achievement-info">
              <h3 class="achievement-name">{{ achievement.name }}</h3>
              <span class="achievement-date">{{ achievement.date }}</span>
            </div>
            <CheckBadgeIcon class="verified-icon" />
          </div>
        </div>
      </section>

      <section class="actions-section">
        <button class="action-btn primary-btn" @click="editProfile">
          <PencilIcon class="btn-icon" />
          <span>Editar Perfil</span>
        </button>
        <button class="action-btn secondary-btn" @click="openSettings">
          <Cog6ToothIcon class="btn-icon" />
          <span>Configurações</span>
        </button>
      </section>
    </div>

    <transition name="fade">
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>
    </transition>

    <transition name="slide-up">
      <div v-if="snackbar.show" :class="['snackbar', `snackbar-${snackbar.type}`]">
        <span class="snackbar-message">{{ snackbar.message }}</span>
        <button class="snackbar-close" @click="hideSnackbar">×</button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import authService from '/src/services/auth.service';
import userService from '/src/services/user.service';

import {
  UserIcon,
  StarIcon,
  TrophyIcon,
  AcademicCapIcon,
  SparklesIcon,
  FireIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
  PencilIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/solid';

const router = useRouter();

const loading = ref(true);
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

const snackbar = ref({
  show: false,
  message: '',
  type: 'info'
});

const getAchievementsCount = (achievements) => {
  return Array.isArray(achievements) ? achievements.length : 0;
};

const statsData = computed(() => [
  {
    key: 'points',
    value: userStats.value.totalPoints,
    label: 'Pontos Totais',
    colorClass: 'icon-primary',
    icon: TrophyIcon
  },
  {
    key: 'quizzes',
    value: userStats.value.quizzesCompleted,
    label: 'Quiz Completos',
    colorClass: 'icon-success',
    icon: AcademicCapIcon
  },
  {
    key: 'achievements',
    value: userStats.value.achievements,
    label: 'Conquistas',
    colorClass: 'icon-warning',
    icon: SparklesIcon
  },
  {
    key: 'streak',
    value: userStats.value.streak,
    label: 'Dias Seguidos',
    colorClass: 'icon-info',
    icon: FireIcon
  }
]);

const categoryProgress = ref([
  {
    name: 'Antigo Testamento',
    percentage: 65,
    completed: 13,
    remaining: 7,
    gradient: 'linear-gradient(90deg, #8b5e34 0%, #a89175 100%)'
  },
  {
    name: 'Novo Testamento',
    percentage: 80,
    completed: 16,
    remaining: 4,
    gradient: 'linear-gradient(90deg, #6d5d47 0%, #8b7355 100%)'
  },
  {
    name: 'Profetas',
    percentage: 45,
    completed: 9,
    remaining: 11,
    gradient: 'linear-gradient(90deg, #8b7355 0%, #a89175 100%)'
  },
  {
    name: 'Evangelhos',
    percentage: 90,
    completed: 18,
    remaining: 2,
    gradient: 'linear-gradient(90deg, #a89175 0%, #c4b5a0 100%)'
  }
]);

const recentAchievements = ref([
  {
    id: 1,
    name: 'Primeiro Quiz',
    date: 'Há 2 dias',
    icon: StarIcon
  },
  {
    id: 2,
    name: '10 Quiz Completos',
    date: 'Há 5 dias',
    icon: TrophyIcon
  },
  {
    id: 3,
    name: 'Mestre do NT',
    date: 'Há 1 semana',
    icon: SparklesIcon
  }
]);

const showSnackbar = (message, type = 'info') => {
  snackbar.value = { show: true, message, type };
  setTimeout(hideSnackbar, 3000);
};

const hideSnackbar = () => {
  snackbar.value.show = false;
};

const loadUserData = async () => {
  loading.value = true;
  
  try {
    const user = authService.getCurrentUser();
    
    if (!user) {
      router.push('/auth/login');
      return;
    }

    userName.value = user.displayName?.trim() || 'Usuário';
    userEmail.value = user.email || '';
    userPhotoURL.value = user.photoURL || '';

    const userData = await userService.getUserProgress(user.uid);
    
    if (userData) {
      userStats.value = {
        totalPoints: userData.totalPoints ?? 0,
        quizzesCompleted: userData.quizzesCompleted ?? 0,
        achievements: getAchievementsCount(userData.achievements),
        streak: userData.currentStreak ?? 0
      };

      userLevel.value = Math.floor((userData.totalPoints ?? 0) / 100) + 1;
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    showSnackbar('Erro ao carregar dados do perfil', 'error');
  } finally {
    loading.value = false;
  }
};

const editProfile = () => {
  showSnackbar('Função em desenvolvimento', 'info');
};

const openSettings = () => {
  showSnackbar('Função em desenvolvimento', 'info');
};

const navigateToAchievements = () => {
  router.push('/achievements');
};

onMounted(() => {
  loadUserData();
});
</script>

<style src="/src/css/pages/profile.scss" scoped></style>
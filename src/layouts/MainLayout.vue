<template>
  <div class="main-layout">
    <header class="app-header">
      <div class="header-toolbar">
        <div class="header-logo" @click="goToHome">
          <BookOpenIcon class="logo-icon" />
          <span class="logo-text">Quiz Bíblico</span>
        </div>
        <div class="spacer"></div>
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
      </div>
    </header>

    <main class="page-container">
      <router-view />
    </main>

    <nav class="bottom-nav">
      <div class="nav-tabs">
        <button
          v-for="tab in navigationTabs"
          :key="tab.name"
          :class="['nav-tab', { 'nav-tab-active': isActiveTab(tab.name), 'nav-tab-primary': tab.primary }]"
          @click="navigateTo(tab.to)"
        >
          <component :is="tab.icon" class="nav-tab-icon" />
          <span class="nav-tab-label">{{ tab.label }}</span>
        </button>
      </div>
    </nav>

    <transition name="dialog-fade">
      <div v-if="showLogoutDialog" class="dialog-backdrop" @click="cancelLogout">
        <div class="dialog-container" @click.stop>
          <div class="dialog-content">
            <div class="dialog-header">
              <h3 class="dialog-title">Confirmar saída</h3>
            </div>
            <div class="dialog-body">
              <p class="dialog-message">Tem certeza que deseja sair?</p>
            </div>
            <div class="dialog-actions">
              <button class="dialog-btn dialog-btn-cancel" @click="cancelLogout">
                Cancelar
              </button>
              <button class="dialog-btn dialog-btn-confirm" @click="confirmLogout">
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

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
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import UserMenu from './UserMenu.vue';
import authService from '/src/services/auth.service';
import userService from '/src/services/user.service';

import {
  BookOpenIcon,
  HomeIcon,
  PlayCircleIcon,
  TrophyIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/vue/24/solid';

const route = useRoute();
const router = useRouter();

const currentTab = ref('home');
const userName = ref('Usuário');
const userEmail = ref('');
const userPhotoURL = ref('');
const userStats = ref({
  totalPoints: 0,
  achievements: 0,
  quizzesCompleted: 0
});

const showLogoutDialog = ref(false);
const snackbar = ref({
  show: false,
  message: '',
  type: 'info',
  icon: CheckCircleIcon
});

const navigationTabs = computed(() => [
  { name: 'home', to: '/', icon: HomeIcon, label: 'Home' },
  { name: 'quiz', to: '/quiz', icon: PlayCircleIcon, label: 'Quiz', primary: true },
  { name: 'achievements', to: '/achievements', icon: TrophyIcon, label: 'Conquistas' },
  { name: 'ranking', to: '/ranking', icon: ChartBarIcon, label: 'Ranking' }
]);

const isActiveTab = (tabName) => route.name === tabName;

watch(
  () => route.name,
  (newName) => currentTab.value = newName,
  { immediate: true }
);

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

const goToHome = () => router.push('/');
const goToProfile = () => router.push('/profile');
const goToAchievements = () => router.push('/achievements');
const goToRanking = () => router.push('/ranking');
const navigateTo = (path) => router.push(path);

const showSnackbar = (message, type = 'info') => {
  const icons = {
    info: CheckCircleIcon,
    success: CheckCircleIcon,
    error: XCircleIcon
  };

  snackbar.value = {
    show: true,
    message,
    type,
    icon: icons[type] || CheckCircleIcon
  };

  setTimeout(hideSnackbar, 3000);
};

const hideSnackbar = () => snackbar.value.show = false;

const handleLogout = () => showLogoutDialog.value = true;
const cancelLogout = () => showLogoutDialog.value = false;

const confirmLogout = async () => {
  showLogoutDialog.value = false;
  
  try {
    await authService.logout();
    showSnackbar('Logout realizado com sucesso', 'success');
    setTimeout(() => router.push('/auth'), 500);
  } catch (error) {
    console.error('Erro no logout:', error);
    showSnackbar('Erro ao fazer logout', 'error');
  }
};

onMounted(loadUserData);
</script>

<style scoped src="/src/css/layouts/main-layout.scss"></style>
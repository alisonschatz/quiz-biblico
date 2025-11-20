<template>
  <div class="user-menu">
    <button
      class="user-menu-trigger"
      @click="toggleMenu"
      aria-label="Abrir menu do usuário"
    >
      <div class="user-avatar">
        <img
          v-if="photoURL"
          :src="photoURL"
          :alt="`Foto de ${name}`"
          class="avatar-img"
        />
        <UserIcon v-else class="avatar-icon" />
      </div>
    </button>

    <transition name="menu-fade">
      <div v-if="isOpen" class="menu-backdrop" @click="closeMenu"></div>
    </transition>

    <transition name="menu-slide">
      <div v-if="isOpen" class="user-menu-dropdown">
        <div class="user-menu-card">
          <div class="user-header">
            <div class="user-header-content">
              <div class="user-avatar-lg">
                <img
                  v-if="photoURL"
                  :src="photoURL"
                  :alt="`Foto de ${name}`"
                  class="avatar-img-lg"
                />
                <UserIcon v-else class="avatar-icon-lg" />
              </div>
              <div class="user-info">
                <div class="user-name">{{ name }}</div>
                <div class="user-email">{{ email }}</div>
              </div>
            </div>
          </div>

          <div class="menu-separator"></div>

          <div class="user-stats">
            <div class="stats-grid">
              <div
                v-for="stat in stats"
                :key="stat.key"
                class="stat-card"
              >
                <component :is="stat.icon" class="stat-icon" />
                <div class="stat-data">
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="menu-separator"></div>

          <div class="menu-list">
            <button
              v-for="item in menuItems"
              :key="item.key"
              class="menu-item"
              :class="{ 'menu-item-danger': item.danger }"
              @click="handleItemClick(item)"
            >
              <component :is="item.icon" class="menu-item-icon" />
              <span class="menu-item-label">{{ item.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  UserIcon,
  TrophyIcon,
  SparklesIcon,
  AcademicCapIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/solid';

const props = defineProps({
  name: {
    type: String,
    default: 'Usuário'
  },
  email: {
    type: String,
    default: ''
  },
  photoURL: {
    type: String,
    default: ''
  },
  userStats: {
    type: Object,
    default: () => ({
      totalPoints: 0,
      achievements: 0,
      quizzesCompleted: 0
    })
  }
});

const emit = defineEmits(['profile', 'achievements', 'ranking', 'logout']);

const isOpen = ref(false);

const stats = computed(() => [
  {
    key: 'points',
    icon: TrophyIcon,
    value: props.userStats.totalPoints,
    label: 'Pontos'
  },
  {
    key: 'achievements',
    icon: SparklesIcon,
    value: props.userStats.achievements,
    label: 'Conquistas'
  },
  {
    key: 'quizzes',
    icon: AcademicCapIcon,
    value: props.userStats.quizzesCompleted,
    label: 'Quiz Feitos'
  }
]);

const menuItems = computed(() => [
  {
    key: 'profile',
    icon: UserCircleIcon,
    label: 'Meu Perfil',
    action: 'profile'
  },
  {
    key: 'achievements',
    icon: ShieldCheckIcon,
    label: 'Minhas Conquistas',
    action: 'achievements'
  },
  {
    key: 'ranking',
    icon: ChartBarIcon,
    label: 'Ranking',
    action: 'ranking'
  },
  {
    key: 'logout',
    icon: ArrowRightOnRectangleIcon,
    label: 'Sair',
    action: 'logout',
    danger: true
  }
]);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const closeMenu = () => {
  isOpen.value = false;
};

const handleItemClick = (item) => {
  emit(item.action);
  closeMenu();
};

const handleClickOutside = (event) => {
  const menu = document.querySelector('.user-menu');
  if (menu && !menu.contains(event.target)) {
    closeMenu();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped src="/src/css/layouts/user-menu.scss"></style>
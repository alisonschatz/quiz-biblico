<template>
  <q-btn
    flat
    round
    dense
    class="user-menu-trigger"
    aria-label="Abrir menu do usuário"
  >
    <!-- Avatar -->
    <div class="user-avatar">
      <img
        v-if="photoURL"
        :src="photoURL"
        :alt="`Foto de ${name}`"
        class="avatar-img"
      />
      <q-icon v-else name="person" class="avatar-icon" />
    </div>

    <!-- Menu Dropdown -->
    <q-menu
      anchor="bottom right"
      self="top right"
      :offset="[0, 8]"
      class="user-menu-dropdown"
    >
      <q-card class="user-menu-card" flat square bordered>
        <!-- Header -->
        <q-card-section class="user-header">
          <div class="user-header-content">
            <div class="user-avatar-lg">
              <img
                v-if="photoURL"
                :src="photoURL"
                :alt="`Foto de ${name}`"
                class="avatar-img-lg"
              />
              <q-icon v-else name="person" class="avatar-icon-lg" />
            </div>
            <div class="user-info">
              <div class="user-name">{{ name }}</div>
              <div class="user-email">{{ email }}</div>
            </div>
          </div>
        </q-card-section>

        <q-separator class="menu-separator" />

        <!-- Stats -->
        <q-card-section class="user-stats">
          <div class="stats-grid">
            <div
              v-for="stat in stats"
              :key="stat.key"
              class="stat-card"
            >
              <q-icon :name="stat.icon" class="stat-icon" />
              <div class="stat-data">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator class="menu-separator" />

        <!-- Menu Items -->
        <q-list class="menu-list">
          <q-item
            v-for="item in menuItems"
            :key="item.key"
            clickable
            v-close-popup
            @click="item.action"
            class="menu-item"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" :color="item.color || 'grey-7'" />
            </q-item-section>
            <q-item-section>
              <q-item-label :class="item.class">{{ item.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-menu>
  </q-btn>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'UserMenu',

  props: {
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
  },

  emits: ['profile', 'achievements', 'ranking', 'logout'],

  setup(props, { emit }) {
    const stats = computed(() => [
      {
        key: 'points',
        icon: 'emoji_events',
        value: props.userStats.totalPoints,
        label: 'Pontos'
      },
      {
        key: 'achievements',
        icon: 'workspace_premium',
        value: props.userStats.achievements,
        label: 'Conquistas'
      },
      {
        key: 'quizzes',
        icon: 'psychology',
        value: props.userStats.quizzesCompleted,
        label: 'Quiz Feitos'
      }
    ]);

    const menuItems = computed(() => [
      {
        key: 'profile',
        icon: 'account_circle',
        label: 'Meu Perfil',
        action: () => emit('profile')
      },
      {
        key: 'achievements',
        icon: 'military_tech',
        label: 'Minhas Conquistas',
        action: () => emit('achievements')
      },
      {
        key: 'ranking',
        icon: 'leaderboard',
        label: 'Ranking',
        action: () => emit('ranking')
      },
      {
        key: 'logout',
        icon: 'logout',
        label: 'Sair',
        color: 'negative',
        class: 'text-negative',
        action: () => emit('logout')
      }
    ]);

    return {
      stats,
      menuItems
    };
  }
};
</script>

<style scoped lang="scss">
/* ========================================
   USER MENU TRIGGER
   ======================================== */
.user-menu-trigger {
  transition: all var(--transition-base);

  &:hover {
    transform: scale(1.08);
  }
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(139, 94, 52, 0.2);
  background: linear-gradient(135deg, rgba(139, 94, 52, 0.1) 0%, rgba(93, 78, 55, 0.1) 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-icon {
  font-size: 20px;
  color: var(--primary);
}

/* ========================================
   USER MENU DROPDOWN
   ======================================== */
.user-menu-dropdown {
  :deep(.q-menu__backdrop) {
    backdrop-filter: blur(4px);
  }
}

.user-menu-card {
  width: 320px;
  max-width: calc(100vw - 32px);
  border-radius: var(--radius-lg);
  border-color: rgba(139, 94, 52, 0.1);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

/* ========================================
   USER HEADER
   ======================================== */
.user-header {
  padding: var(--spacing-2xl);
  background: linear-gradient(135deg, rgba(139, 94, 52, 0.05) 0%, rgba(245, 241, 232, 0.5) 100%);
}

.user-header-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  min-height: 64px;
}

.user-avatar-lg {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid rgba(139, 94, 52, 0.2);
  background: linear-gradient(135deg, rgba(139, 94, 52, 0.1) 0%, rgba(93, 78, 55, 0.1) 100%);
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img-lg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-icon-lg {
  font-size: 32px;
  color: var(--primary);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-email {
  font-size: 13px;
  color: var(--text-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ========================================
   USER STATS
   ======================================== */
.user-stats {
  padding: var(--spacing-xl) var(--spacing-2xl);
}

.stats-grid {
  display: flex;
  gap: var(--spacing-lg);
}

.stat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-sm);
  background: rgba(139, 94, 52, 0.03);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);

  &:hover {
    background: rgba(139, 94, 52, 0.06);
    transform: translateY(-2px);
  }
}

.stat-icon {
  font-size: 24px;
  color: var(--primary);
}

.stat-data {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: var(--text-medium);
  margin-top: 4px;
  font-weight: 600;
}

/* ========================================
   MENU LIST
   ======================================== */
.menu-list {
  padding: var(--spacing-sm) 0;
}

.menu-item {
  border-radius: var(--radius-sm);
  margin: 0 var(--spacing-sm) var(--spacing-xs);
  transition: all var(--transition-base);

  &:hover {
    background: rgba(139, 94, 52, 0.05);
  }

  &:has(.text-negative):hover {
    background: rgba(244, 67, 54, 0.05);
  }

  .q-item__label {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-dark);
  }
}

.menu-separator {
  height: 1px;
  background-color: rgba(139, 94, 52, 0.1);
  margin: var(--spacing-xs) var(--spacing-sm);
}

/* ========================================
   RESPONSIVE
   ======================================== */
@media (max-width: 480px) {
  .user-menu-card {
    max-width: calc(100vw - 24px);
  }

  .user-stats {
    padding: var(--spacing-lg) var(--spacing-xl);
  }

  .stat-card {
    padding: 10px 6px;
  }

  .stat-icon {
    font-size: 22px;
  }

  .stat-value {
    font-size: 18px;
  }
}
</style>
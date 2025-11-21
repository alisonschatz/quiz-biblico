<template>
  <div class="achievements-page">
    <div class="achievements-container">
      <!-- Header -->
      <section class="header-section">
        <div class="header-content">
          <div class="header-icon-box">
            <TrophyIcon class="header-icon" />
          </div>
          <div class="header-text">
            <h1 class="header-title">Conquistas</h1>
            <p class="header-subtitle">Desbloqueie conquistas completando desafios</p>
          </div>
        </div>
      </section>

      <!-- Progress Card -->
      <section class="progress-section">
        <div class="progress-card">
          <div class="progress-card-content">
            <div class="progress-left">
              <div class="progress-main">
                <div class="progress-count">{{ unlockedCount }}/{{ totalCount }}</div>
                <div class="progress-label">Conquistas Desbloqueadas</div>
              </div>
              <div class="progress-bar-wrapper">
                <div class="progress-track">
                  <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
                </div>
                <div class="progress-percentage">{{ progressPercentage }}% Completo</div>
              </div>
            </div>
            <div class="progress-icon-box">
              <SparklesIcon class="progress-icon" />
            </div>
          </div>
        </div>
      </section>

      <!-- Filters -->
      <section class="filter-section">
        <div class="filter-tabs">
          <button
            v-for="filter in filters"
            :key="filter.value"
            :class="['filter-tab', { active: activeFilter === filter.value }]"
            @click="activeFilter = filter.value"
          >
            <component :is="filter.icon" class="filter-icon" />
            <span>{{ filter.label }}</span>
            <span v-if="filter.count !== undefined" class="filter-count">{{ filter.count }}</span>
          </button>
        </div>
      </section>

      <!-- Achievements Grid -->
      <section class="content-section">
        <div v-if="!filteredAchievements.length" class="empty-state">
          <TrophyIcon class="empty-icon" />
          <h3 class="empty-title">Nenhuma conquista encontrada</h3>
          <p class="empty-text">Complete quiz para desbloquear conquistas incríveis</p>
        </div>

        <div v-else class="achievements-grid">
          <div
            v-for="a in filteredAchievements"
            :key="a.id"
            :class="['achievement-card', { unlocked: a.unlocked }]"
            @click="openDetails(a)"
          >
            <div class="achievement-glow" v-if="a.unlocked && a.rarity === 'legendary'"></div>

            <div class="achievement-header">
              <div :class="['achievement-icon-wrapper', `rarity-${a.rarity}`]">
                <div class="icon-bg"></div>
                <component :is="a.icon" class="achievement-icon" />
                <div v-if="a.unlocked" class="unlock-badge">
                  <CheckCircleIcon class="unlock-icon" />
                </div>
                <div v-else class="lock-overlay">
                  <LockClosedIcon class="lock-icon" />
                </div>
              </div>
            </div>

            <div class="achievement-body">
              <div class="achievement-top">
                <h3 class="achievement-name">{{ a.name }}</h3>
                <div class="achievement-points">
                  <StarIcon class="points-icon" />
                  <span>{{ a.points }}</span>
                </div>
              </div>
              <p class="achievement-description">{{ a.description }}</p>
              <div v-if="!a.unlocked" class="achievement-progress">
                <div class="progress-info">
                  <span class="progress-text">Progresso</span>
                  <span class="progress-value">{{ a.progress }}%</span>
                </div>
                <div class="progress-track-small">
                  <div class="progress-fill-small" :style="{ width: `${a.progress}%` }"></div>
                </div>
              </div>
              <div v-else class="achievement-unlocked">
                <CheckCircleIcon class="unlocked-icon" />
                <span class="unlocked-text">{{ a.unlockedDate }}</span>
              </div>
            </div>

            <div :class="['rarity-border', `rarity-${a.rarity}`]"></div>
          </div>
        </div>
      </section>

      <!-- Category Progress -->
      <section class="content-section">
        <div class="section-header">
          <h2 class="section-title">
            <ChartBarIcon class="section-icon" />
            Progresso por Categoria
          </h2>
        </div>
        <div class="category-grid">
          <div v-for="c in categories" :key="c.id" class="category-card">
            <div class="category-header">
              <div class="category-icon-box">
                <component :is="c.icon" class="category-icon" />
              </div>
              <div class="category-info">
                <h3 class="category-name">{{ c.name }}</h3>
                <p class="category-stats">{{ c.unlocked }}/{{ c.total }} desbloqueadas</p>
              </div>
            </div>
            <div class="category-progress">
              <div class="category-percentage">{{ c.percentage }}%</div>
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: `${c.percentage}%`, background: c.gradient }"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Modal -->
    <transition name="modal-fade">
      <div v-if="selectedAchievement" class="modal-overlay" @click="closeDetails">
        <transition name="modal-slide">
          <div class="modal-content" @click.stop>
            <div class="modal-inner">
              <button class="modal-close" @click="closeDetails">×</button>

              <div :class="['modal-icon-wrapper', `rarity-${selectedAchievement.rarity}`]">
                <div class="modal-icon-bg"></div>
                <component :is="selectedAchievement.icon" class="modal-icon" />
                <div v-if="selectedAchievement.unlocked" class="modal-unlock-badge">
                  <CheckCircleIcon class="modal-unlock-icon" />
                </div>
              </div>

              <div :class="['rarity-badge', `rarity-${selectedAchievement.rarity}`]">
                {{ rarityLabels[selectedAchievement.rarity] }}
              </div>

              <h2 class="modal-title">{{ selectedAchievement.name }}</h2>
              <p class="modal-description">{{ selectedAchievement.description }}</p>

              <div class="modal-divider"></div>

              <div class="modal-stats">
                <div class="modal-stat">
                  <StarIcon class="modal-stat-icon" />
                  <div class="modal-stat-info">
                    <span class="modal-stat-label">Pontos</span>
                    <span class="modal-stat-value">{{ selectedAchievement.points }}</span>
                  </div>
                </div>
                <div class="modal-stat">
                  <FireIcon class="modal-stat-icon" />
                  <div class="modal-stat-info">
                    <span class="modal-stat-label">Raridade</span>
                    <span class="modal-stat-value">{{ rarityLabels[selectedAchievement.rarity] }}</span>
                  </div>
                </div>
              </div>

              <div class="modal-divider"></div>

              <div v-if="selectedAchievement.unlocked" class="modal-status unlocked">
                <CheckCircleIcon class="status-icon" />
                <div class="status-info">
                  <span class="status-label">Desbloqueado</span>
                  <span class="status-date">{{ selectedAchievement.unlockedDate }}</span>
                </div>
              </div>
              <div v-else class="modal-status">
                <div class="status-progress">
                  <div class="status-progress-header">
                    <span class="status-label">Progresso</span>
                    <span class="status-percentage">{{ selectedAchievement.progress }}%</span>
                  </div>
                  <div class="progress-track">
                    <div class="progress-fill" :style="{ width: `${selectedAchievement.progress}%` }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- Loading -->
    <transition name="fade">
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import authService from '/src/services/auth.service';
import userService from '/src/services/user.service';
import achievementsService from '/src/services/achievements.service';

// Icons
import {
  TrophyIcon,
  StarIcon,
  SparklesIcon,
  LockClosedIcon,
  CheckCircleIcon,
  FireIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BoltIcon
} from '@heroicons/vue/24/solid';

const router = useRouter();
const loading = ref(true);
const activeFilter = ref('all');
const selectedAchievement = ref(null);
const achievements = ref([]);

// Computed
const unlockedCount = computed(() => achievements.value.filter(a => a.unlocked).length);
const totalCount = computed(() => achievements.value.length);
const progressPercentage = computed(() => totalCount.value ? Math.round((unlockedCount.value / totalCount.value) * 100) : 0);

const rarityLabels = { common: 'Comum', rare: 'Rara', epic: 'Épica', legendary: 'Lendária' };

const filters = computed(() => [
  { value: 'all', label: 'Todas', icon: TrophyIcon, count: totalCount.value },
  { value: 'unlocked', label: 'Desbloqueadas', icon: CheckCircleIcon, count: unlockedCount.value },
  { value: 'locked', label: 'Bloqueadas', icon: LockClosedIcon, count: totalCount.value - unlockedCount.value }
]);

const categories = [
  { id: 1, name: 'Iniciante', icon: StarIcon, unlocked: 3, total: 5, percentage: 60, gradient: 'linear-gradient(90deg, #8b5e34, #a89175)' },
  { id: 2, name: 'Progresso', icon: ChartBarIcon, unlocked: 5, total: 10, percentage: 50, gradient: 'linear-gradient(90deg, #6d5d47, #8b7355)' },
  { id: 3, name: 'Maestria', icon: AcademicCapIcon, unlocked: 2, total: 8, percentage: 25, gradient: 'linear-gradient(90deg, #8b7355, #a89175)' },
  { id: 4, name: 'Especiais', icon: SparklesIcon, unlocked: 1, total: 6, percentage: 17, gradient: 'linear-gradient(90deg, #a89175, #c4b5a0)' }
];

const filteredAchievements = computed(() => {
  if (activeFilter.value === 'unlocked') return achievements.value.filter(a => a.unlocked);
  if (activeFilter.value === 'locked') return achievements.value.filter(a => !a.unlocked);
  return achievements.value;
});

// Methods
const openDetails = (a) => {
  selectedAchievement.value = a;
  document.body.style.overflow = 'hidden';
};

const closeDetails = () => {
  selectedAchievement.value = null;
  document.body.style.overflow = '';
};

// Utils
const formatDate = (daysAgo) => {
  if (daysAgo === 0) return 'Hoje';
  if (daysAgo === 1) return 'Ontem';
  return `Há ${daysAgo} dias`;
};

// Data load
const loadData = async () => {
  try {
    const user = authService.getCurrentUser();
    if (!user) return router.push('/auth');

    const [userProgress, data] = await Promise.all([
      userService.getUserProgress(user.uid),
      achievementsService.getAllAchievements()
    ]);

    const icons = [TrophyIcon, StarIcon, BoltIcon, SparklesIcon, ShieldCheckIcon, FireIcon, AcademicCapIcon, BookOpenIcon];
    const rarities = Object.keys(rarityLabels);
    const points = [10, 25, 50, 100];

    achievements.value = data.map((item, i) => {
      const unlocked = userProgress?.achievementsUnlocked?.includes(item.id) || false;
      const daysAgo = unlocked ? Math.floor(Math.random() * 15) : null;

      return {
        ...item,
        icon: icons[i % icons.length],
        unlocked,
        progress: unlocked ? 100 : Math.floor(Math.random() * 90) + 10,
        unlockedDate: daysAgo ? formatDate(daysAgo) : null,
        rarity: rarities[Math.floor(Math.random() * rarities.length)],
        points: points[Math.floor(Math.random() * points.length)]
      };
    });
  } catch (error) {
    console.error('Erro ao carregar conquistas:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);
</script>

<style src="/src/css/pages/achievements.scss" scoped></style>
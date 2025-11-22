<template>
  <div class="ranking-page">
    <div class="ranking-container">
      <section class="header-section">
        <div class="header-content">
          <div class="header-icon-box">
            <TrophyIcon class="header-icon" />
          </div>
          <div class="header-text">
            <h1 class="header-title">Ranking Global</h1>
            <p class="header-subtitle">Veja os melhores jogadores do quiz bíblico</p>
          </div>
        </div>
        
        <button 
          v-if="!rankingStore.loading && !rankingStore.isEmpty"
          class="refresh-btn"
          @click="refreshRanking"
          :disabled="rankingStore.loading"
        >
          <ArrowPathIcon class="refresh-icon" :class="{ spinning: isRefreshing }" />
          Atualizar
        </button>
      </section>

      <template v-if="rankingStore.loading">
        <div class="loading-overlay-content">
          <div class="loading-spinner"></div>
          <p class="loading-text">Carregando ranking...</p>
        </div>
      </template>
      
      <template v-else>
        <section v-if="rankingStore.topThree.length" class="podium-section">
          <div
            class="podium-container"
            :class="{
              'has-all-three': rankingStore.topThree.length >= 3,
              'has-two': rankingStore.topThree.length === 2,
              'has-one': rankingStore.topThree.length === 1
            }"
          >
            <div
              v-for="(player, idx) in rankingStore.topThree"
              :key="player.id"
              :class="[
                'podium-card',
                { 
                  'first-place': idx === 0, 
                  'second-place': idx === 1, 
                  'third-place': idx === 2,
                  'is-current-user': player.id === authStore.userId
                }
              ]"
            >
              <div v-if="idx === 0" class="champion-crown">👑</div>
              
              <div v-if="player.id === authStore.userId" class="current-user-badge">
                Você
              </div>
              
              <div :class="['podium-rank-badge', { champion: idx === 0 }]">
                <span class="rank-number">{{ idx + 1 }}</span>
              </div>
              
              <div class="podium-avatar-container">
                <img 
                  v-if="rankingStore.getUserPhoto(player.id)"
                  :src="rankingStore.getUserPhoto(player.id)" 
                  :alt="rankingStore.getUserName(player.id)"
                  class="podium-avatar"
                  @error="(e) => e.target.style.display = 'none'"
                />
                <div
                  v-else
                  :class="[
                    'podium-icon-box',
                    { gold: idx === 0, silver: idx === 1, bronze: idx === 2 }
                  ]"
                >
                  <component
                    :is="idx === 0 ? TrophyIcon : StarIcon"
                    class="podium-icon"
                  />
                </div>
              </div>
              
              <div class="podium-info">
                <h3 class="podium-name">{{ rankingStore.getUserName(player.id) }}</h3>
                <div class="podium-level">
                  <span class="level-badge">Nível {{ player.level }}</span>
                </div>
                <div class="podium-xp">
                  <FireIcon class="xp-icon" />
                  <span class="xp-value">{{ player.totalXp }}</span>
                  <span class="xp-label">XP</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section v-if="rankingStore.restOfRanking.length" class="ranking-section">
          <div class="section-header">
            <h2 class="section-title">
              <ChartBarIcon class="title-icon" />
              Classificação Completa
            </h2>
          </div>
          
          <div class="ranking-list">
            <div
              v-for="(player, idx) in rankingStore.restOfRanking"
              :key="player.id"
              :class="[
                'ranking-card',
                { 'is-current-user': player.id === authStore.userId }
              ]"
            >
              <div class="ranking-card-content">
                <div class="rank-badge">
                  <span class="rank-number">{{ idx + 4 }}</span>
                </div>
                
                <div class="player-info">
                  <div class="player-name-row">
                    <h3 class="player-name">{{ rankingStore.getUserName(player.id) }}</h3>
                    <span v-if="player.id === authStore.userId" class="current-user-badge">
                      Você
                    </span>
                  </div>
                  <div class="player-stats-row">
                    <span class="player-stat">
                      <span class="stat-badge">Nível {{ player.level }}</span>
                    </span>
                    <span class="player-stat accuracy">
                      <CheckCircleIcon class="stat-icon-sm" />
                      {{ rankingStore.calculateAccuracy(player) }}%
                    </span>
                  </div>
                </div>
                
                <div class="player-xp">
                  <div class="xp-display">
                    <FireIcon class="xp-icon-sm" />
                    <span class="xp-value">{{ player.totalXp }}</span>
                  </div>
                  <span class="xp-questions">{{ player.questionsAnswered }} perguntas</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section v-if="rankingStore.isEmpty" class="empty-section">
          <div class="empty-content">
            <div class="empty-icon-box">
              <TrophyIcon class="empty-icon" />
            </div>
            <h3 class="empty-title">Ranking em construção</h3>
            <p class="empty-subtitle">Seja o primeiro a jogar e aparecer no ranking!</p>
            <button class="start-quiz-btn" @click="goToQuiz">
              Começar Quiz
            </button>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRankingStore } from '../stores/ranking.store';
import { useAuthStore } from '../stores/auth.store';
import rankingService from '../services/ranking.service';

import {
  TrophyIcon,
  StarIcon,
  FireIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/solid';

const router = useRouter();
const rankingStore = useRankingStore();
const authStore = useAuthStore();
const isRefreshing = ref(false);

const loadRanking = async () => {
  try {
    await rankingService.getTopPlayers(100);
  } catch (error) {
    console.error('Erro ao carregar ranking:', error);
  }
};

const refreshRanking = async () => {
  isRefreshing.value = true;
  try {
    await rankingService.refreshRanking();
  } catch (error) {
    console.error('Erro ao atualizar ranking:', error);
  } finally {
    setTimeout(() => {
      isRefreshing.value = false;
    }, 500);
  }
};

const goToQuiz = () => {
  router.push('/quiz');
};

onMounted(() => {
  loadRanking();
});
</script>

<style scoped src="../css/pages/ranking.scss"></style>
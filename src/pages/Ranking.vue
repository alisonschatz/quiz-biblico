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
      </section>

      <template v-if="loading">
        <div class="loading-overlay-content">
          <div class="loading-spinner"></div>
          <p class="loading-text">Carregando ranking...</p>
        </div>
      </template>
      <template v-else>
        <section v-if="topThree.length" class="podium-section">
          <div
            class="podium-container"
            :class="{
              'has-all-three': topThree.length >= 3,
              'has-two': topThree.length === 2,
              'has-one': topThree.length === 1
            }"
          >
            <div
              v-for="(player, idx) in topThree"
              :key="player.id"
              :class="[
                'podium-card',
                { 'first-place': idx === 0, 'second-place': idx === 1, 'third-place': idx === 2 }
              ]"
            >
              <div v-if="idx === 0" class="champion-crown">👑</div>
              <div :class="['podium-rank-badge', { champion: idx === 0 }]">
                <span class="rank-number">{{ idx + 1 }}</span>
              </div>
              <div
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
              <div class="podium-info">
                <h3 class="podium-name">{{ getUserName(player.id) }}</h3>
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

        <section v-if="restOfRanking.length" class="ranking-section">
          <div class="section-header">
            <h2 class="section-title">
              <ChartBarIcon class="title-icon" />
              Classificação Completa
            </h2>
          </div>
          <div class="ranking-list">
            <div
              v-for="(player, idx) in restOfRanking"
              :key="player.id"
              class="ranking-card"
            >
              <div class="ranking-card-content">
                <div class="rank-badge">
                  <span class="rank-number">{{ idx + 4 }}</span>
                </div>
                <div class="player-info">
                  <h3 class="player-name">{{ getUserName(player.id) }}</h3>
                  <div class="player-stats-row">
                    <span class="player-stat">
                      <span class="stat-badge">Nível {{ player.level }}</span>
                    </span>
                    <span class="player-stat accuracy">
                      <CheckCircleIcon class="stat-icon-sm" />
                      {{ calculateAccuracy(player) }}%
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

        <section v-if="!topThree.length && !restOfRanking.length" class="empty-section">
          <div class="empty-content">
            <div class="empty-icon-box">
              <TrophyIcon class="empty-icon" />
            </div>
            <h3 class="empty-title">Ranking em construção</h3>
            <p class="empty-subtitle">Seja o primeiro a jogar e aparecer no ranking!</p>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../boot/firebase';
import rankingService from '../services/ranking.service';
import {
  TrophyIcon,
  StarIcon,
  FireIcon,
  ChartBarIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/solid';

const loading = ref(true);
const ranking = ref([]);
const users = ref([]);

const topThree = computed(() => ranking.value.slice(0, 3));
const restOfRanking = computed(() => ranking.value.slice(3));

const getUserName = (userId) => {
  const user = users.value.find(u => u.id === userId);
  if (user?.displayName) return user.displayName;
  const progress = ranking.value.find(p => p.id === userId);
  return progress?.email?.split('@')[0] || 'Jogador';
};

const calculateAccuracy = (player) => {
  if (!player || player.questionsAnswered === 0) return 0;
  return Math.round((player.correctAnswers / player.questionsAnswered) * 100);
};

onMounted(async () => {
  loading.value = true;
  try {
    ranking.value = (await rankingService.getTopPlayers(100)) ?? [];
    
    const snapshot = await getDocs(collection(db, 'users'));
    users.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erro ao carregar ranking:', error);
    ranking.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped src="../css/pages/ranking.scss"></style>
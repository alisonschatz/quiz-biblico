<template>
  <q-page class="ranking-page">
    <div class="container q-pa-md">
      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>

      <template v-if="!loading">
        <!-- Header -->
        <div class="q-mb-lg">
          <h1 class="text-h4 text-weight-bold text-grey-9 q-mb-xs row items-center">
            <q-icon name="leaderboard" color="amber-7" size="32px" class="q-mr-sm" />
            Ranking Global
          </h1>
          <p class="text-body1 text-grey-7">
            Veja os melhores jogadores do quiz bíblico
          </p>
        </div>

        <!-- Top 3 Podium -->
        <div v-if="topThree.length >= 3" class="podium q-mb-lg">
          <!-- 2nd Place -->
          <q-card class="podium-card second">
            <q-card-section class="text-center q-pa-md">
              <q-icon name="workspace_premium" size="48px" color="white" class="q-mb-sm" />
              <div class="text-caption text-white-7 q-mb-xs">2º Lugar</div>
              <div class="text-h6 text-white text-weight-bold ellipsis q-mb-sm">
                {{ getUserName(topThree[1].id) }}
              </div>
              <q-badge color="white-3" text-color="white" class="q-mb-xs">
                Nível {{ topThree[1].level }}
              </q-badge>
              <div class="text-h5 text-white text-weight-bold q-mt-sm">
                {{ topThree[1].totalXp }} XP
              </div>
            </q-card-section>
          </q-card>

          <!-- 1st Place -->
          <q-card class="podium-card first">
            <q-card-section class="text-center q-pa-lg">
              <q-icon name="emoji_events" size="64px" color="white" class="q-mb-sm" />
              <div class="text-caption text-white-7 q-mb-xs">🏆 Campeão</div>
              <div class="text-h5 text-white text-weight-bold ellipsis q-mb-sm">
                {{ getUserName(topThree[0].id) }}
              </div>
              <q-badge color="white-3" text-color="white" class="q-mb-xs">
                Nível {{ topThree[0].level }}
              </q-badge>
              <div class="text-h4 text-white text-weight-bold q-mt-sm">
                {{ topThree[0].totalXp }} XP
              </div>
            </q-card-section>
          </q-card>

          <!-- 3rd Place -->
          <q-card class="podium-card third">
            <q-card-section class="text-center q-pa-md">
              <q-icon name="workspace_premium" size="48px" color="white" class="q-mb-sm" />
              <div class="text-caption text-white-7 q-mb-xs">3º Lugar</div>
              <div class="text-h6 text-white text-weight-bold ellipsis q-mb-sm">
                {{ getUserName(topThree[2].id) }}
              </div>
              <q-badge color="white-3" text-color="white" class="q-mb-xs">
                Nível {{ topThree[2].level }}
              </q-badge>
              <div class="text-h5 text-white text-weight-bold q-mt-sm">
                {{ topThree[2].totalXp }} XP
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Rest of Ranking -->
        <div v-if="restOfRanking.length > 0" class="ranking-list">
          <q-card
            v-for="(player, index) in restOfRanking"
            :key="player.id"
            class="ranking-item q-mb-sm"
          >
            <q-card-section class="q-pa-md">
              <div class="row items-center q-gutter-md">
                <div class="rank-badge">
                  <span class="text-h6 text-white text-weight-bold">
                    {{ index + 4 }}
                  </span>
                </div>

                <div class="col">
                  <div class="text-subtitle1 text-weight-bold text-grey-9 ellipsis q-mb-xs">
                    {{ getUserName(player.id) }}
                  </div>
                  <div class="row items-center q-gutter-sm">
                    <q-badge outline color="grey-7">
                      Nível {{ player.level }}
                    </q-badge>
                    <span class="text-caption text-grey-7 row items-center">
                      <q-icon name="check_circle" size="12px" class="q-mr-xs" />
                      {{ calculateAccuracy(player) }}%
                    </span>
                  </div>
                </div>

                <div class="text-right">
                  <div class="text-h6 text-weight-bold text-purple-7 row items-center justify-end">
                    <q-icon name="bolt" size="16px" class="q-mr-xs" />
                    {{ player.totalXp }}
                  </div>
                  <div class="text-caption text-grey-6">
                    {{ player.questionsAnswered }} perguntas
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Empty State -->
        <div v-if="ranking.length === 0" class="text-center q-pa-xl">
          <q-icon name="emoji_events" size="64px" color="purple-7" class="q-mb-md" />
          <h3 class="text-h6 text-weight-bold text-grey-9 q-mb-sm">
            Ranking em construção
          </h3>
          <p class="text-body2 text-grey-7">
            Seja o primeiro a jogar e aparecer no ranking!
          </p>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../boot/firebase';
import rankingService from '../services/ranking.service';

export default {
  name: 'RankingPage',
  
  setup() {
    const loading = ref(true);
    const ranking = ref([]);
    const users = ref([]);
    
    const topThree = computed(() => ranking.value.slice(0, 3));
    const restOfRanking = computed(() => ranking.value.slice(3));
    
    const getUserName = (userId) => {
      const user = users.value.find(u => u.id === userId);
      if (user?.displayName) {
        return user.displayName;
      }
      // Fallback to email prefix if no display name
      const progress = ranking.value.find(p => p.id === userId);
      return progress?.email?.split('@')[0] || 'Jogador';
    };
    
    const calculateAccuracy = (player) => {
      if (player.questionsAnswered === 0) return 0;
      return Math.round((player.correctAnswers / player.questionsAnswered) * 100);
    };
    
    onMounted(async () => {
      try {
        const rankingData = await rankingService.getTopPlayers(100);
        ranking.value = rankingData;
        
        // Load users data
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const usersData = [];
        usersSnapshot.forEach((doc) => {
          usersData.push({ id: doc.id, ...doc.data() });
        });
        users.value = usersData;
      } catch (error) {
        console.error('Erro ao carregar ranking:', error);
      } finally {
        loading.value = false;
      }
    });
    
    return {
      loading,
      ranking,
      topThree,
      restOfRanking,
      getUserName,
      calculateAccuracy
    };
  }
};
</script>

<style scoped lang="scss">
.ranking-page {
  background: linear-gradient(135deg, #faf5ff 0%, #eff6ff 50%, #fef3c7 100%);
  min-height: 100vh;
  padding-bottom: 80px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.podium {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 16px;
}

.podium-card {
  flex: 1;
  max-width: 300px;
  border: none;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  
  &.first {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    transform: scale(1.1);
  }
  
  &.second {
    background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%);
  }
  
  &.third {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  }
}

.text-white-7 {
  color: rgba(255, 255, 255, 0.7);
}

.text-white-3 {
  color: rgba(255, 255, 255, 0.3);
}

.ranking-list {
  display: flex;
  flex-direction: column;
}

.ranking-item {
  background: white;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
}

.rank-badge {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .podium {
    flex-direction: column;
    align-items: center;
    
    .podium-card {
      max-width: 100%;
      width: 100%;
      
      &.first {
        order: -1;
        transform: scale(1);
      }
    }
  }
}
</style>

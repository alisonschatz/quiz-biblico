import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useRankingStore = defineStore('ranking', () => {
  const ranking = ref([]);
  const users = ref([]);
  const loading = ref(false);
  const lastUpdated = ref(null);
  const cacheTimeout = 5 * 60 * 1000;

  const topThree = computed(() => ranking.value.slice(0, 3));
  const restOfRanking = computed(() => ranking.value.slice(3));
  const isEmpty = computed(() => ranking.value.length === 0);
  const needsRefresh = computed(() => {
    if (!lastUpdated.value) return true;
    return Date.now() - lastUpdated.value > cacheTimeout;
  });

  function setRanking(data) {
    ranking.value = data;
    lastUpdated.value = Date.now();
  }

  function setUsers(data) {
    users.value = data;
  }

  function setLoading(value) {
    loading.value = value;
  }

  function getUserName(userId) {
    const user = users.value.find(u => u.id === userId);
    if (user?.displayName) return user.displayName;
    
    const progress = ranking.value.find(p => p.id === userId);
    return progress?.email?.split('@')[0] || 'Jogador';
  }

  function getUserPhoto(userId) {
    const user = users.value.find(u => u.id === userId);
    return user?.photoURL || null;
  }

  function calculateAccuracy(player) {
    if (!player || player.questionsAnswered === 0) return 0;
    return Math.round((player.correctAnswers / player.questionsAnswered) * 100);
  }

  function clearCache() {
    ranking.value = [];
    users.value = [];
    lastUpdated.value = null;
  }

  return {
    ranking,
    users,
    loading,
    lastUpdated,
    topThree,
    restOfRanking,
    isEmpty,
    needsRefresh,
    setRanking,
    setUsers,
    setLoading,
    getUserName,
    getUserPhoto,
    calculateAccuracy,
    clearCache
  };
});
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const userProgress = ref(null);
  const loading = ref(false);

  const isAuthenticated = computed(() => !!user.value);
  const userPhotoURL = computed(() => user.value?.photoURL || '');
  const userName = computed(() => user.value?.displayName || 'Usuário');
  const userEmail = computed(() => user.value?.email || '');
  const userId = computed(() => user.value?.uid || '');

  function setUser(userData) {
    user.value = userData;
  }

  function setUserProgress(progressData) {
    userProgress.value = progressData;
  }

  function setLoading(value) {
    loading.value = value;
  }

  function clearAuth() {
    user.value = null;
    userProgress.value = null;
  }

  function updateProgress(data) {
    if (userProgress.value) {
      userProgress.value = { ...userProgress.value, ...data };
    }
  }

  return {
    user,
    userProgress,
    loading,
    isAuthenticated,
    userPhotoURL,
    userName,
    userEmail,
    userId,
    setUser,
    setUserProgress,
    setLoading,
    clearAuth,
    updateProgress
  };
});
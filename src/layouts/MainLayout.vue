<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bottom-nav">
      <q-tabs
        v-model="currentTab"
        active-color="white"
        active-bg-color="primary"
        indicator-color="transparent"
        class="text-grey-7"
      >
        <q-route-tab
          name="home"
          to="/"
          icon="home"
          label="Home"
          class="nav-tab"
        />
        <q-route-tab
          name="quiz"
          to="/quiz"
          icon="play_circle"
          label="Quiz"
          class="nav-tab"
        />
        <q-route-tab
          name="achievements"
          to="/achievements"
          icon="emoji_events"
          label="Conquistas"
          class="nav-tab"
        />
        <q-route-tab
          name="ranking"
          to="/ranking"
          icon="leaderboard"
          label="Ranking"
          class="nav-tab"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'MainLayout',
  
  setup() {
    const route = useRoute();
    const currentTab = ref('home');
    
    watch(() => route.name, (newName) => {
      currentTab.value = newName;
    }, { immediate: true });
    
    return {
      currentTab
    };
  }
};
</script>

<style scoped lang="scss">
.bottom-nav {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
}

:deep(.nav-tab) {
  border-radius: 12px;
  margin: 8px 4px;
  transition: all 0.3s ease;
  
  .q-tab__label {
    font-size: 12px;
    font-weight: 500;
  }
  
  &.q-tab--active {
    background: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%);
    
    .q-tab__label {
      color: white;
    }
  }
}
</style>

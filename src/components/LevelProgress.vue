<template>
  <q-card class="level-progress-card">
    <q-card-section class="q-pa-lg">
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-md">
          <div class="level-icon">
            <q-icon name="emoji_events" size="32px" color="white" />
          </div>
          <div>
            <div class="text-caption text-white-7">Nível Atual</div>
            <div class="text-h3 text-white text-weight-bold">{{ level }}</div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-caption text-white-7">Próximo Nível</div>
          <div class="text-h6 text-white text-weight-bold row items-center q-gutter-xs">
            <q-icon name="bolt" size="16px" />
            <span>{{ currentXP }} / {{ nextLevelXP }} XP</span>
          </div>
        </div>
      </div>
      
      <q-linear-progress 
        :value="progress" 
        color="white" 
        track-color="white-3"
        size="12px"
        rounded
        class="progress-bar"
      />
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: 'LevelProgress',
  
  props: {
    level: {
      type: Number,
      required: true
    },
    currentXP: {
      type: Number,
      required: true
    },
    nextLevelXP: {
      type: Number,
      required: true
    }
  },
  
  computed: {
    progress() {
      return this.currentXP / this.nextLevelXP;
    }
  }
};
</script>

<style scoped lang="scss">
.level-progress-card {
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  border: none;
  box-shadow: 0 10px 40px rgba(245, 158, 11, 0.3);
  border-radius: 16px;
}

.level-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-white-7 {
  color: rgba(255, 255, 255, 0.7);
}

.text-white-3 {
  color: rgba(255, 255, 255, 0.3);
}

.progress-bar {
  transition: all 0.5s ease;
}
</style>

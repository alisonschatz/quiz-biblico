<template>
  <q-card :class="['achievement-card', { unlocked }]">
    <div v-if="!unlocked" class="lock-overlay">
      <q-icon name="lock" size="32px" color="grey-5" />
    </div>
    
    <q-card-section class="text-center q-pa-md">
      <div :class="['achievement-icon', rarityClass]">
        <q-icon name="emoji_events" size="32px" :color="unlocked ? 'white' : 'grey-5'" />
      </div>
      
      <h3 class="text-subtitle1 text-weight-bold text-grey-9 q-mt-md q-mb-xs">
        {{ achievement.title }}
      </h3>
      
      <p class="text-caption text-grey-7 q-mb-sm">
        {{ achievement.description }}
      </p>
      
      <q-badge 
        :color="unlocked ? rarityColor : 'grey-4'" 
        outline 
        class="text-caption q-mt-xs"
      >
        {{ rarityLabel }}
      </q-badge>
      
      <div v-if="achievement.xpReward && unlocked" class="text-caption text-purple-7 text-weight-medium q-mt-xs">
        +{{ achievement.xpReward }} XP
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: 'AchievementBadge',
  
  props: {
    achievement: {
      type: Object,
      required: true
    },
    unlocked: {
      type: Boolean,
      default: false
    }
  },
  
  computed: {
    rarityLabel() {
      const labels = {
        comum: 'Comum',
        rara: 'Rara',
        epica: 'Épica',
        lendaria: 'Lendária'
      };
      return labels[this.achievement.rarity] || 'Comum';
    },
    
    rarityColor() {
      const colors = {
        comum: 'grey-6',
        rara: 'blue',
        epica: 'purple',
        lendaria: 'amber'
      };
      return colors[this.achievement.rarity] || 'grey-6';
    },
    
    rarityClass() {
      return this.unlocked ? this.achievement.rarity : 'locked';
    }
  }
};
</script>

<style scoped lang="scss">
.achievement-card {
  border: 2px solid;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &.unlocked {
    &:hover {
      transform: scale(1.05);
    }
  }
  
  &:not(.unlocked) {
    opacity: 0.6;
    border-color: #e5e7eb;
  }
}

.lock-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.achievement-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  
  &.comum {
    background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  }
  
  &.rara {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  }
  
  &.epica {
    background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
  }
  
  &.lendaria {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  }
  
  &.locked {
    background: #e5e7eb;
  }
}
</style>

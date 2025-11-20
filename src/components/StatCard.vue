<template>
  <q-card class="stat-card" :style="{ background: gradient }">
    <q-card-section class="q-pa-md">
      <div class="icon-bg">
        <q-icon :name="icon" size="80px" color="white" class="opacity-20" />
      </div>
      
      <div class="content">
        <div class="row items-center q-gutter-xs q-mb-sm">
          <q-icon :name="icon" size="20px" color="white" class="opacity-90" />
          <span class="text-caption text-white-8">{{ label }}</span>
        </div>
        <div class="text-h3 text-white text-weight-bold">{{ value }}</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: 'StatCard',
  
  props: {
    icon: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    },
    gradient: {
      type: String,
      default: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)'
    }
  }
};
</script>

<style scoped lang="scss">
.stat-card {
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
}

.icon-bg {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(24px, -24px);
}

.content {
  position: relative;
  z-index: 10;
}

.text-white-8 {
  color: rgba(255, 255, 255, 0.8);
}

.opacity-20 {
  opacity: 0.2;
}

.opacity-90 {
  opacity: 0.9;
}
</style>

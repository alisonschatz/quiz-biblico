<template>
  <q-card class="question-card">
    <div class="progress-indicator" />
    
    <q-card-section class="q-pa-lg">
      <div class="row items-center justify-between q-mb-lg">
        <q-badge outline color="grey-7" class="text-caption">
          Pergunta {{ questionNumber }} de {{ totalQuestions }}
        </q-badge>
        
        <div class="row q-gutter-sm">
          <q-badge :color="difficultyColor" class="text-caption">
            {{ difficultyLabel }}
          </q-badge>
          <q-badge outline color="purple-7" class="text-caption">
            {{ categoryLabel }}
          </q-badge>
        </div>
      </div>

      <h2 class="text-h5 text-weight-bold text-grey-9 q-mb-lg">
        {{ question.question }}
      </h2>

      <div class="q-gutter-md q-mb-lg">
        <q-btn
          v-for="(option, index) in question.options"
          :key="index"
          :outline="selectedOption !== index || showResult"
          :color="getOptionColor(index)"
          :disable="showResult"
          :class="['option-btn', { 'selected': selectedOption === index && !showResult }]"
          @click="selectOption(index)"
          no-caps
          align="left"
          padding="16px"
        >
          <div class="full-width row items-center q-gutter-md">
            <div class="option-badge">
              <q-icon 
                v-if="showResult && index === question.correctAnswer" 
                name="check" 
                size="20px"
              />
              <q-icon 
                v-else-if="showResult && selectedOption === index && index !== question.correctAnswer" 
                name="close" 
                size="20px"
              />
              <span v-else>{{ String.fromCharCode(65 + index) }}</span>
            </div>
            <span class="text-body1">{{ option }}</span>
          </div>
        </q-btn>
      </div>

      <q-slide-transition>
        <div v-if="showResult" class="result-box q-mb-lg">
          <div class="row items-start q-gutter-md">
            <div :class="['result-icon', isCorrect ? 'correct' : 'incorrect']">
              <q-icon :name="isCorrect ? 'check' : 'close'" size="24px" color="white" />
            </div>
            <div class="col">
              <h3 :class="['text-h6 text-weight-bold q-mb-sm', isCorrect ? 'text-green-9' : 'text-red-9']">
                {{ isCorrect ? 'Correto! 🎉' : 'Ops! Não foi dessa vez' }}
              </h3>
              <p v-if="question.explanation" class="text-body2 text-grey-8 q-mb-sm">
                {{ question.explanation }}
              </p>
              <div v-if="question.verseReference" class="row items-center q-gutter-xs text-purple-7">
                <q-icon name="menu_book" size="16px" />
                <span class="text-caption text-weight-medium">{{ question.verseReference }}</span>
              </div>
            </div>
          </div>
        </div>
      </q-slide-transition>

      <q-btn
        :disable="selectedOption === null || showResult"
        color="primary"
        :label="showResult ? 'Próxima pergunta...' : 'Confirmar Resposta'"
        no-caps
        unelevated
        size="lg"
        class="full-width confirm-btn"
        @click="confirmAnswer"
      >
        <q-icon v-if="showResult" name="auto_awesome" size="20px" class="q-ml-sm" />
      </q-btn>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: 'QuestionCard',
  
  props: {
    question: {
      type: Object,
      required: true
    },
    questionNumber: {
      type: Number,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    }
  },
  
  emits: ['answer'],
  
  data() {
    return {
      selectedOption: null,
      showResult: false,
      isCorrect: false
    };
  },
  
  computed: {
    difficultyLabel() {
      const labels = {
        facil: 'Fácil',
        medio: 'Médio',
        dificil: 'Difícil'
      };
      return labels[this.question.difficulty] || 'Médio';
    },
    
    difficultyColor() {
      const colors = {
        facil: 'green',
        medio: 'yellow-9',
        dificil: 'red'
      };
      return colors[this.question.difficulty] || 'yellow-9';
    },
    
    categoryLabel() {
      const labels = {
        antigo_testamento: 'Antigo Testamento',
        novo_testamento: 'Novo Testamento',
        personagens: 'Personagens',
        milagres: 'Milagres',
        parabolas: 'Parábolas',
        livros_biblicos: 'Livros Bíblicos'
      };
      return labels[this.question.category] || this.question.category;
    }
  },
  
  methods: {
    selectOption(index) {
      if (this.showResult) return;
      this.selectedOption = index;
    },
    
    confirmAnswer() {
      if (this.selectedOption === null) return;
      
      this.isCorrect = this.selectedOption === this.question.correctAnswer;
      this.showResult = true;
      
      setTimeout(() => {
        this.$emit('answer', this.isCorrect, this.selectedOption);
        this.selectedOption = null;
        this.showResult = false;
      }, 2500);
    },
    
    getOptionColor(index) {
      if (!this.showResult) {
        return this.selectedOption === index ? 'purple' : 'grey-4';
      }
      
      if (index === this.question.correctAnswer) {
        return 'green';
      }
      
      if (this.selectedOption === index && index !== this.question.correctAnswer) {
        return 'red';
      }
      
      return 'grey-4';
    }
  }
};
</script>

<style scoped lang="scss">
.question-card {
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.progress-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #9333ea 0%, #3b82f6 50%, #f59e0b 100%);
}

.option-btn {
  border-radius: 12px;
  border-width: 2px;
  transition: all 0.3s ease;
  
  &.selected {
    transform: scale(1.02);
  }
}

.option-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid currentColor;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.result-box {
  padding: 16px;
  border-radius: 12px;
  
  &:has(.correct) {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.2);
  }
  
  &:has(.incorrect) {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
  }
}

.result-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  &.correct {
    background: #22c55e;
  }
  
  &.incorrect {
    background: #ef4444;
  }
}

.confirm-btn {
  border-radius: 12px;
  height: 56px;
  font-size: 18px;
  font-weight: bold;
  background: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%);
}
</style>

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useQuizStore = defineStore('quiz', () => {
  const questions = ref([]);
  const currentQuestionIndex = ref(0);
  const score = ref(0);
  const xpEarned = ref(0);
  const selectedOption = ref(null);
  const showResult = ref(false);
  const isProcessing = ref(false);
  const quizComplete = ref(false);
  const startTime = ref(null);
  const elapsedTime = ref(0);
  const timerInterval = ref(null);
  const currentStreak = ref(0);

  const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);
  
  const progressPercentage = computed(() => {
    if (!questions.value.length) return 0;
    return Math.round(((currentQuestionIndex.value + 1) / questions.value.length) * 100);
  });

  const accuracy = computed(() => {
    if (!questions.value.length) return 0;
    return Math.round((score.value / questions.value.length) * 100);
  });

  const difficultyLabel = computed(() => {
    const difficulty = currentQuestion.value?.difficulty;
    const map = {
      'facil': 'Fácil',
      'medio': 'Médio',
      'dificil': 'Difícil',
      'easy': 'Fácil',
      'medium': 'Médio',
      'hard': 'Difícil'
    };
    return map[difficulty] || 'Médio';
  });

  const difficultyClass = computed(() => {
    const difficulty = currentQuestion.value?.difficulty;
    const map = {
      'facil': 'easy',
      'medio': 'medium',
      'dificil': 'hard',
      'easy': 'easy',
      'medium': 'medium',
      'hard': 'hard'
    };
    return map[difficulty] || 'medium';
  });

  const categoryLabel = computed(() => {
    const rawCategory = currentQuestion.value?.category || currentQuestion.value?.categoria || 'geral';
    
    const categoryMap = {
      'salmos': 'Salmos',
      'novo_testamento': 'Novo Testamento',
      'milagres': 'Milagres',
      'antigo_testamento': 'Antigo Testamento',
      'profetas': 'Profetas',
      'geral': 'Geral',
      'Salmos': 'Salmos',
      'Novo Testamento': 'Novo Testamento',
      'Milagres': 'Milagres',
      'Antigo Testamento': 'Antigo Testamento',
      'Profetas': 'Profetas',
      'Geral': 'Geral'
    };
    
    return categoryMap[rawCategory] || rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);
  });

  const isLastQuestion = computed(() => {
    return currentQuestionIndex.value === questions.value.length - 1;
  });

  const formattedTime = computed(() => {
    const mins = Math.floor(elapsedTime.value / 60);
    const secs = elapsedTime.value % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  });

  function setQuestions(newQuestions) {
    questions.value = newQuestions;
  }

  function setCurrentStreak(streak) {
    currentStreak.value = streak;
  }

  function selectOption(index) {
    if (!showResult.value) {
      selectedOption.value = index;
    }
  }

  function startTimer() {
    startTime.value = Date.now();
    timerInterval.value = setInterval(() => {
      elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000);
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
  }

  function startProcessing() {
    isProcessing.value = true;
    showResult.value = true;
  }

  function finishProcessing() {
    isProcessing.value = false;
  }

  function answerCorrect(xp) {
    score.value++;
    xpEarned.value += xp;
  }

  function nextQuestion() {
    currentQuestionIndex.value++;
    selectedOption.value = null;
    showResult.value = false;
  }

  function completeQuiz() {
    stopTimer();
    quizComplete.value = true;
  }

  function resetQuiz() {
    questions.value = [];
    currentQuestionIndex.value = 0;
    score.value = 0;
    xpEarned.value = 0;
    selectedOption.value = null;
    showResult.value = false;
    isProcessing.value = false;
    quizComplete.value = false;
    startTime.value = null;
    elapsedTime.value = 0;
    stopTimer();
  }

  return {
    questions,
    currentQuestionIndex,
    score,
    xpEarned,
    selectedOption,
    showResult,
    isProcessing,
    quizComplete,
    elapsedTime,
    currentStreak,
    currentQuestion,
    progressPercentage,
    accuracy,
    difficultyLabel,
    difficultyClass,
    categoryLabel,
    isLastQuestion,
    formattedTime,
    setQuestions,
    setCurrentStreak,
    selectOption,
    startTimer,
    stopTimer,
    startProcessing,
    finishProcessing,
    answerCorrect,
    nextQuestion,
    completeQuiz,
    resetQuiz
  };
});
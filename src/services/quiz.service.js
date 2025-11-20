import { 
  collection, 
  getDocs, 
  query, 
  limit,
  orderBy 
} from 'firebase/firestore';
import { db } from '../boot/firebase';

class QuizService {
  async getRandomQuestions(count = 10) {
    try {
      const questionsRef = collection(db, 'questions');
      const querySnapshot = await getDocs(questionsRef);
      
      const allQuestions = [];
      querySnapshot.forEach((doc) => {
        allQuestions.push({ id: doc.id, ...doc.data() });
      });

      // Embaralha e seleciona quantidade desejada
      const shuffled = allQuestions.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(count, shuffled.length));
    } catch (error) {
      console.error('Erro ao buscar perguntas:', error);
      throw error;
    }
  }

  async getAllQuestions() {
    try {
      const questionsRef = collection(db, 'questions');
      const querySnapshot = await getDocs(questionsRef);
      
      const questions = [];
      querySnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...doc.data() });
      });

      return questions;
    } catch (error) {
      console.error('Erro ao buscar todas as perguntas:', error);
      throw error;
    }
  }

  calculateXP(difficulty) {
    const xpMap = {
      facil: 10,
      medio: 20,
      dificil: 30
    };
    return xpMap[difficulty] || 10;
  }

  calculateLevel(totalXp) {
    return Math.floor(totalXp / 100) + 1;
  }

  calculateNextLevelXP(level) {
    return level * 100;
  }
}

export default new QuizService();

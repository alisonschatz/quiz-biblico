import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../boot/firebase';

class UserService {
  async createUserProgress(userId, email, displayName) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        email,
        displayName,
        createdAt: serverTimestamp()
      });

      const progressRef = doc(db, 'userProgress', userId);
      await setDoc(progressRef, {
        totalXp: 0,
        level: 1,
        questionsAnswered: 0,
        correctAnswers: 0,
        currentStreak: 0,
        bestStreak: 0,
        lastPlayed: null,
        achievementsUnlocked: []
      });

      return { userId, email, displayName };
    } catch (error) {
      console.error('Erro ao criar progresso do usuário:', error);
      throw error;
    }
  }

  async getUserProgress(userId) {
    try {
      const progressRef = doc(db, 'userProgress', userId);
      const progressSnap = await getDoc(progressRef);

      if (progressSnap.exists()) {
        return { id: progressSnap.id, ...progressSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
      throw error;
    }
  }

  async updateUserProgress(userId, data) {
    try {
      const progressRef = doc(db, 'userProgress', userId);
      await updateDoc(progressRef, data);
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      throw error;
    }
  }

  async getUser(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }
}

export default new UserService();

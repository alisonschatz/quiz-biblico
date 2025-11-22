import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../boot/firebase';
import { useAuthStore } from '../stores/auth.store';
import { useRankingStore } from '../stores/ranking.store';

class UserService {
  async createUserProgress(userId, email, displayName, photoURL = '') {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        email,
        displayName,
        photoURL,
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

      return { userId, email, displayName, photoURL };
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

      const authStore = useAuthStore();
      if (authStore.userId === userId) {
        authStore.updateProgress(data);
      }

      const rankingStore = useRankingStore();
      if (data.totalXp !== undefined) {
        rankingStore.clearCache();
      }
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

  async updateUserProfile(userId, displayName, photoURL) {
    try {
      const userRef = doc(db, 'users', userId);
      
      await setDoc(userRef, {
        displayName: displayName || 'Usuário',
        photoURL: photoURL || '',
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      console.log('✅ Perfil do usuário atualizado');
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      throw error;
    }
  }
}

export default new UserService();
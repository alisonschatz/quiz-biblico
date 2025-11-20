import { 
  collection, 
  getDocs, 
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from '../boot/firebase';

class AchievementsService {
  async getAllAchievements() {
    try {
      const achievementsRef = collection(db, 'achievements');
      const q = query(achievementsRef, orderBy('rarity'));
      const querySnapshot = await getDocs(q);
      
      const achievements = [];
      querySnapshot.forEach((doc) => {
        achievements.push({ id: doc.id, ...doc.data() });
      });

      return achievements;
    } catch (error) {
      console.error('Erro ao buscar conquistas:', error);
      throw error;
    }
  }

  checkAchievements(progress, achievements) {
    const unlockedIds = progress.achievementsUnlocked || [];
    const newUnlocked = [];

    achievements.forEach(achievement => {
      if (unlockedIds.includes(achievement.id)) return;

      let unlock = false;

      switch (achievement.condition.type) {
        case 'questions_answered':
          unlock = progress.questionsAnswered >= achievement.condition.value;
          break;
        case 'correct_answers':
          unlock = progress.correctAnswers >= achievement.condition.value;
          break;
        case 'level_reached':
          unlock = progress.level >= achievement.condition.value;
          break;
        case 'streak':
          unlock = progress.currentStreak >= achievement.condition.value;
          break;
        case 'total_xp':
          unlock = progress.totalXp >= achievement.condition.value;
          break;
        case 'accuracy':
          const accuracy = progress.questionsAnswered > 0 
            ? (progress.correctAnswers / progress.questionsAnswered) * 100 
            : 0;
          unlock = accuracy >= achievement.condition.value;
          break;
      }

      if (unlock) {
        newUnlocked.push(achievement.id);
      }
    });

    return newUnlocked;
  }
}

export default new AchievementsService();

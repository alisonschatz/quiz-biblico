import { 
  collection, 
  getDocs, 
  query,
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from '../boot/firebase';

class RankingService {
  async getTopPlayers(limitCount = 100) {
    try {
      const progressRef = collection(db, 'userProgress');
      const q = query(progressRef, orderBy('totalXp', 'desc'), limit(limitCount));
      const querySnapshot = await getDocs(q);
      
      const ranking = [];
      querySnapshot.forEach((doc) => {
        ranking.push({ id: doc.id, ...doc.data() });
      });

      return ranking;
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
      throw error;
    }
  }

  async getUserRank(userId, totalXp) {
    try {
      const progressRef = collection(db, 'userProgress');
      const q = query(progressRef, orderBy('totalXp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      let rank = 0;
      querySnapshot.forEach((doc) => {
        rank++;
        if (doc.id === userId) {
          return rank;
        }
      });

      return rank;
    } catch (error) {
      console.error('Erro ao buscar posição no ranking:', error);
      throw error;
    }
  }
}

export default new RankingService();

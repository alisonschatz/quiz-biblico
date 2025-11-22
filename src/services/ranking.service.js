import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../boot/firebase';
import { useRankingStore } from '../stores/ranking.store';

class RankingService {
  async getTopPlayers(limitCount = 100) {
    try {
      const rankingStore = useRankingStore();
      
      if (!rankingStore.needsRefresh && rankingStore.ranking.length > 0) {
        console.log('📦 Usando ranking do cache');
        return rankingStore.ranking;
      }

      console.log('🔄 Buscando ranking do Firestore...');
      rankingStore.setLoading(true);

      const progressRef = collection(db, 'userProgress');
      const q = query(progressRef, orderBy('totalXp', 'desc'), limit(limitCount));
      const querySnapshot = await getDocs(q);
      
      const ranking = [];
      querySnapshot.forEach(doc => {
        ranking.push({ id: doc.id, ...doc.data() });
      });

      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const users = [];
      usersSnapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });

      rankingStore.setRanking(ranking);
      rankingStore.setUsers(users);
      rankingStore.setLoading(false);

      console.log('✅ Ranking carregado:', ranking.length, 'jogadores');
      return ranking;
    } catch (error) {
      console.error('❌ Erro ao buscar ranking:', error);
      const rankingStore = useRankingStore();
      rankingStore.setLoading(false);
      throw error;
    }
  }

  async getUserRank(userId) {
    try {
      const rankingStore = useRankingStore();
      
      if (rankingStore.ranking.length > 0) {
        const position = rankingStore.ranking.findIndex(p => p.id === userId);
        if (position >= 0) {
          console.log('📦 Posição encontrada no cache:', position + 1);
          return position + 1;
        }
      }

      console.log('🔄 Buscando posição do Firestore...');
      const progressRef = collection(db, 'userProgress');
      const q = query(progressRef, orderBy('totalXp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      let rank = 0;
      let found = false;
      
      querySnapshot.forEach(doc => {
        rank++;
        if (doc.id === userId) {
          found = true;
        }
      });

      console.log('✅ Posição encontrada:', rank);
      return found ? rank : null;
    } catch (error) {
      console.error('❌ Erro ao buscar posição no ranking:', error);
      throw error;
    }
  }

  async refreshRanking(limitCount = 100) {
    try {
      console.log('🔄 Forçando atualização do ranking...');
      const rankingStore = useRankingStore();
      rankingStore.clearCache();
      return await this.getTopPlayers(limitCount);
    } catch (error) {
      console.error('❌ Erro ao atualizar ranking:', error);
      throw error;
    }
  }

  getUserPosition(userId) {
    const rankingStore = useRankingStore();
    const position = rankingStore.ranking.findIndex(p => p.id === userId);
    return position >= 0 ? position + 1 : null;
  }

  isUserInTopThree(userId) {
    const rankingStore = useRankingStore();
    return rankingStore.topThree.some(p => p.id === userId);
  }

  getPlayerData(userId) {
    const rankingStore = useRankingStore();
    return rankingStore.ranking.find(p => p.id === userId) || null;
  }

  clearCache() {
    const rankingStore = useRankingStore();
    rankingStore.clearCache();
    console.log('🗑️ Cache do ranking limpo');
  }
}

export default new RankingService();
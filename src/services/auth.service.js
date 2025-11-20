import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../boot/firebase';

class AuthService {
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  async register(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      return userCredential.user;
    } catch (error) {
      console.error('Erro ao registrar:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }

  getCurrentUser() {
    return auth.currentUser;
  }

  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
}

export default new AuthService();

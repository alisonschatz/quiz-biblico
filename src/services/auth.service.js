import { 
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../boot/firebase';
import userService from './user.service';

class AuthService {
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userExists = await userService.getUserProgress(user.uid);
      
      if (!userExists) {
        await userService.createUserProgress(
          user.uid,
          user.email,
          user.displayName || 'Usuário'
        );
      }

      return user;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
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
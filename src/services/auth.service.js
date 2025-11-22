import { signOut, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../boot/firebase';
import userService from './user.service';
import { useAuthStore } from '../stores/auth.store';

class AuthService {
  async loginWithGoogle() {
    try {
      const authStore = useAuthStore();
      authStore.setLoading(true);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      authStore.setUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Usuário',
        photoURL: user.photoURL || '',
        emailVerified: user.emailVerified
      });

      const userProgress = await userService.getUserProgress(user.uid);
      
      if (!userProgress) {
        await userService.createUserProgress(
          user.uid,
          user.email,
          user.displayName || 'Usuário',
          user.photoURL || ''
        );
        
        const newProgress = await userService.getUserProgress(user.uid);
        authStore.setUserProgress(newProgress);
      } else {
        await userService.updateUserProfile(
          user.uid,
          user.displayName || 'Usuário',
          user.photoURL || ''
        );
        
        authStore.setUserProgress(userProgress);
      }

      authStore.setLoading(false);
      return user;
    } catch (error) {
      const authStore = useAuthStore();
      authStore.setLoading(false);
      console.error('Google login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      const authStore = useAuthStore();
      authStore.setLoading(true);
      
      await signOut(auth);
      authStore.clearAuth();
      
      authStore.setLoading(false);
    } catch (error) {
      const authStore = useAuthStore();
      authStore.setLoading(false);
      console.error('Logout error:', error);
      throw error;
    }
  }

  getCurrentUser() {
    return auth.currentUser;
  }

  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, async (user) => {
      const authStore = useAuthStore();
      
      if (user) {
        authStore.setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Usuário',
          photoURL: user.photoURL || '',
          emailVerified: user.emailVerified
        });

        try {
          await userService.updateUserProfile(
            user.uid,
            user.displayName || 'Usuário',
            user.photoURL || ''
          );
        } catch (error) {
          console.error('Erro ao atualizar perfil:', error);
        }

        try {
          const userProgress = await userService.getUserProgress(user.uid);
          if (userProgress) {
            authStore.setUserProgress(userProgress);
          }
        } catch (error) {
          console.error('Erro ao carregar progresso:', error);
        }
      } else {
        authStore.clearAuth();
      }

      if (callback) callback(user);
    });
  }
}

export default new AuthService();
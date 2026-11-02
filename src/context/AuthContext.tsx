import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService, type User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const sessionUser = await authService.getSession();
        setUser(sessionUser);
        if (sessionUser) {
          authService.saveUserProfileToFirestore(sessionUser).catch((err) => {
            console.warn('Session Firestore sync error:', err);
          });
        }
      } catch (error) {
        console.error('Failed to restore session', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    // Automatically persist logged-in user profile into Firebase Firestore
    authService.saveUserProfileToFirestore(newUser).catch((err) => {
      console.warn('Login Firestore sync error:', err);
    });
  };

  const logout = async () => {
    if (user) {
      await authService.saveUserProfileToFirestore(user).catch(() => {});
    }
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: () => {},
      logout: async () => {}
    };
  }
  return context;
}

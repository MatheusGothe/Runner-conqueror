import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { User } from '@/types';

const USER_KEY = '@territory_user';

export const [AuthContext, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const usersData = await AsyncStorage.getItem('@territory_users');
      const users: User[] = usersData ? JSON.parse(usersData) : [];
      
      const foundUser = users.find(u => u.email === email);
      
      if (foundUser) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(foundUser));
        setUser(foundUser);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const usersData = await AsyncStorage.getItem('@territory_users');
      const users: User[] = usersData ? JSON.parse(usersData) : [];
      
      if (users.find(u => u.email === email)) {
        return false;
      }

      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      await AsyncStorage.setItem('@territory_users', JSON.stringify(users));
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
      setUser(newUser);
      return true;
    } catch (error) {
      console.error('Error registering:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(USER_KEY);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
});

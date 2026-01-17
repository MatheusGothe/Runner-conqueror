import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { User } from '@/types';
import { supabase } from '@/lib/supabase';
import { AuthError } from '@supabase/supabase-js';
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
const login = async (
  email: string,
  password: string
) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return { success: false, error };
    }

    const userData: User = {
      id: data.user.id,
      name: data.user.user_metadata?.name ?? '',
      email: data.user.email!,
      createdAt: data.user.created_at,
    };

    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);

    return { success: true, error: null };
  } catch (err) {
    console.error('Error logging in:', err);
    return {
      success: false,
      error: {
        name: 'AuthError',
        message: 'Erro inesperado',
        status: 500,
      } as AuthError,
    };
  }
};
const register = async (
  name: string,
  email: string,
  password: string
)  => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error || !data.user) {
      return { success: false, error };
    }

    const newUser: User = {
      id: data.user.id,
      name,
      email: data.user.email!,
      createdAt: data.user.created_at,
    };

    await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setUser(newUser);

    return { success: true, error: null };
  } catch (err) {
    console.error('Error registering:', err);
    return {
      success: false,
      error: {
        name: 'AuthError',
        message: 'Erro inesperado',
        status: 500,
      } as AuthError,
    };
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

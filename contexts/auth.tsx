import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import { User } from "@/types";
import { supabase } from "@/lib/supabase";
import { AuthError } from "@supabase/supabase-js";
import { ProfileService } from "@/src/services/profileService";
import { sendVerificationEmail } from "@/src/utils/sendVerificationEmail";
const USER_KEY = "@territory_user";

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
      console.error("Error loading user:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        console.log("Login falhou:", error);
        return {
          success: false,
          error: {
            name: error?.name || "AuthError",
            message: error?.message || "Email ou senha inválidos",
          } as AuthError,
        };
      }

      const userData: User = {
        id: data.user.id,
        name: data.user.user_metadata?.name ?? "",
        email: data.user.email!,
        createdAt: data.user.created_at,
      };
      sendVerificationEmail(email);
      /*await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);*/

      return { success: true, error: null };
    } catch (err) {
      console.error("Erro inesperado ao logar:", err);
      return {
        success: false,
        error: {
          name: "AuthError",
          message: "Erro inesperado",
          status: 500,
        } as AuthError,
      };
    }
  };
  const register = async (name: string, email: string, password: string) => {
    let createdUserId: string | null = null;

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

      createdUserId = data.user.id;

      // 🔹 Criação do profile no banco
      const profileCreated = await ProfileService.createProfile({
        id: createdUserId,
        name,
        email: data.user.email!,
        avatar_url: null,
        bio: null,
      });

      if (!profileCreated) {
        await supabase.functions.invoke("delete-auth-user", {
          body: { userId: createdUserId },
        });
        throw new Error("Falha ao criar profile");
      }

      return {
        success: true,
        error: null,
      };
    } catch (err: any) {
      console.error("Erro no register:", err);

      // 🔥 Rollback completo
      if (createdUserId) {
        try {
          await ProfileService.deleteProfile(createdUserId);
          await supabase.functions.invoke("delete-auth-user", {
            body: { userId: createdUserId },
          });
        } catch (rollbackError) {
          console.error("Erro no rollback:", rollbackError);
        }
      }

      return {
        success: false,
        error: {
          name: "RegisterError",
          message: "Erro ao criar conta. Tente novamente.",
          status: 500,
          messageDescription: err.message,
        },
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(USER_KEY);
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
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

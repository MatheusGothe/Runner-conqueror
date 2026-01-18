import { supabase } from "@/lib/supabase";
import { Profile } from "@/types";

export const ProfileService = {
  // Busca o profile pelo userId
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Erro ao buscar profile:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Erro inesperado ao buscar profile:", err);
      return null;
    }
  },

  // Atualiza campos do profile
  async updateProfile(
    userId: string,
    updates: Partial<Profile>,
  ): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Erro ao atualizar profile:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Erro inesperado ao atualizar profile:", err);
      return null;
    }
  },
  async createProfile(profile: any): Promise<boolean> {
    try {
      const { error } = await supabase.from("profiles").insert(profile);

      if (error) {
        console.error("Erro ao criar profile:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Erro inesperado ao criar profile:", err);
      return false;
    }
  },

  async deleteProfile(userId: string): Promise<void> {
    const { error } = await supabase.from("profiles").delete().eq("id", userId);

    if (error) {
      throw error;
    }
  },
};

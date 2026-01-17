import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/types";

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  loadProfile: (userId: string) => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,

  loadProfile: async (userId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      set({ profile: data });
    } catch (err) {
      console.error("Erro ao carregar profile:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (data: Partial<Profile>) => {
    const profile = get().profile;
    if (!profile) return;

    try {
      const { data: updated, error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", profile.id)
        .single();

      if (error) throw error;
      set({ profile: updated });
    } catch (err) {
      console.error("Erro ao atualizar profile:", err);
    }
  },
}));

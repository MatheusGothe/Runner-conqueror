import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

export const sendVerificationEmail = async (email: string) => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      // opcional: redirecionamento após confirmação

    });

    if (error) {
      console.error("Erro ao reenviar email de verificação:", error);
      Alert.alert("Erro", "Não foi possível reenviar o email de confirmação.");
      return false;
    }

    Alert.alert(
      "Email enviado",
      "O email de confirmação foi reenviado! Por favor, verifique sua caixa de entrada."
    );
    return true;
  } catch (err) {
    console.error("Erro inesperado ao reenviar email:", err);
    Alert.alert("Erro", "Erro inesperado ao reenviar o email de confirmação.");
    return false;
  }
};

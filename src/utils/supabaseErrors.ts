import { AuthError } from '@supabase/supabase-js';

export function getAuthErrorMessage(error: AuthError | null) {
  if (!error) return 'Erro inesperado. Tente novamente.';

  switch (error.code) {
    case 'invalid_credentials':
      return 'Email ou senha inválidos';

    case 'email_not_confirmed':
      return 'Confirme seu email antes de entrar';

    case 'user_not_found':
      return 'Usuário não encontrado';

    case 'email_address_invalid':
      return 'Email inválido';

    case 'weak_password':
      return 'A senha deve ter pelo menos 6 caracteres';

    case 'email_address_already_exists':
      return 'Este email já está cadastrado';

    case 'signup_disabled':
      return 'Cadastro temporariamente desativado';

    case 'too_many_requests':
      return 'Muitas tentativas. Aguarde alguns minutos';

    default:
      // fallback seguro
      return error.message || 'Erro ao autenticar. Tente novamente.';
  }
}

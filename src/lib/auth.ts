import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { Profile, UserRole } from '../types/database';

export interface SignUpParams {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse<T = unknown> {
  data: T | null;
  error: AuthError | Error | null;
}

export async function signUpUser(params: SignUpParams): Promise<AuthResponse<{ user: User | null; session: Session | null }>> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          role: params.role,
          first_name: params.firstName,
          last_name: params.lastName,
          full_name: `${params.firstName} ${params.lastName}`.trim(),
          phone: params.phone,
        },
      },
    });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

export async function signInUser(email: string, password: string): Promise<AuthResponse<{ user: User; session: Session }>> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { data: null, error };
    }

    return { data: data as { user: User; session: Session }, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

export async function signOutUser(): Promise<{ error: AuthError | Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

export async function requestPasswordReset(email: string, redirectTo?: string): Promise<{ error: AuthError | Error | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || (typeof window !== 'undefined' ? window.location.origin : undefined),
    });
    return { error };
  } catch (err) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .maybeSingle();

    if (error || !data) return null;
    return data as Profile;
  } catch {
    return null;
  }
}

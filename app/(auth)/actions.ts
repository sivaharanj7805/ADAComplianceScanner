'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod/v4';
import { createClient } from '@/lib/supabase/server';

export type AuthState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
  success?: boolean;
  message?: string;
};

const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const signupSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  company_name: z.string().optional(),
});

const resetSchema = z.object({
  email: z.email('Please enter a valid email address'),
});

export async function signIn(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  try {
    const raw = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const result = loginSchema.safeParse(raw);
    if (!result.success) {
      return {
        error: 'Please fix the errors below.',
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });

    if (error) {
      return { error: error.message };
    }
  } catch (err) {
    // Re-throw redirect errors (Next.js uses thrown errors for redirect)
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') throw err;
    console.error('[signIn] Unexpected error:', err);
    return { error: 'Something went wrong. Please try again.' };
  }

  redirect('/dashboard');
}

export async function signUp(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  try {
    const raw = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      company_name: (formData.get('company_name') as string) || undefined,
    };

    const result = signupSchema.safeParse(raw);
    if (!result.success) {
      return {
        error: 'Please fix the errors below.',
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        data: {
          company_name: result.data.company_name,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    return {
      success: true,
      message:
        'Check your email for a confirmation link to complete your signup.',
    };
  } catch (err) {
    console.error('[signUp] Unexpected error:', err);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export async function resetPassword(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  try {
    const raw = {
      email: formData.get('email') as string,
    };

    const result = resetSchema.safeParse(raw);
    if (!result.success) {
      return {
        error: 'Please fix the errors below.',
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      result.data.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/settings`,
      }
    );

    if (error) {
      return { error: error.message };
    }

    return {
      success: true,
      message: 'Check your email for a password reset link.',
    };
  } catch (err) {
    console.error('[resetPassword] Unexpected error:', err);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export async function signInWithGoogle() {
  let redirectUrl: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error || !data.url) {
      redirectUrl = '/login?error=oauth_failed';
    } else {
      redirectUrl = data.url;
    }
  } catch (err) {
    console.error('[signInWithGoogle] Unexpected error:', err);
    redirectUrl = '/login?error=oauth_failed';
  }

  redirect(redirectUrl!);
}

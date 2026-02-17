'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { signUp, signInWithGoogle, type AuthState } from '../actions';

const initialState: AuthState = {};

function PasswordRequirement({
  met,
  label,
}: {
  met: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-gray-300" />
      )}
      <span className={met ? 'text-green-700' : 'text-gray-500'}>
        {label}
      </span>
    </div>
  );
}

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, initialState);
  const [password, setPassword] = useState('');

  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  if (state.success) {
    return (
      <div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <h1 className="text-lg font-semibold text-green-800">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-green-700">{state.message}</p>
        </div>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already confirmed?{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">
        Create your account
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Log in
        </Link>
      </p>

      {/* Google OAuth */}
      <form action={signInWithGoogle} className="mt-8">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>
      </form>

      {/* Divider */}
      <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">
            or continue with email
          </span>
        </div>
      </div>

      {/* Signup form */}
      <form action={formAction} className="mt-6 space-y-4">
        {state.error && !state.fieldErrors && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
            placeholder="you@company.com"
          />
          {state.fieldErrors?.email && (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="company_name"
            className="block text-sm font-medium text-gray-700"
          >
            Company name{' '}
            <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="company_name"
            name="company_name"
            type="text"
            autoComplete="organization"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
            placeholder="Acme Inc."
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
            placeholder="••••••••"
          />
          {state.fieldErrors?.password && (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.password[0]}
            </p>
          )}
          {password.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <PasswordRequirement
                met={requirements.length}
                label="At least 8 characters"
              />
              <PasswordRequirement
                met={requirements.uppercase}
                label="One uppercase letter"
              />
              <PasswordRequirement
                met={requirements.number}
                label="One number"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-center text-xs text-gray-500">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>
    </div>
  );
}

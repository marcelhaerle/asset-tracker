'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginForm({ redirectTo = '/' }: { redirectTo?: string }) {
  const router = useRouter();

  const { login } = useAuth();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await login(username, password);

      if (success) {
        // Redirect to the original destination or home
        router.push(redirectTo || '/');
        router.refresh(); // Refresh to update auth state
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="notification is-danger is-light">
          <p>{error}</p>
        </div>
      )}

      <div className="field">
        <label className="label" htmlFor="username">
          Username
        </label>
        <div className="control has-icons-left">
          <input
            id="username"
            className="input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <span className="icon is-small is-left">
            <i className="fas fa-user"></i>
          </span>
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="password">
          Password
        </label>
        <div className="control has-icons-left">
          <input
            id="password"
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <span className="icon is-small is-left">
            <i className="fas fa-lock"></i>
          </span>
        </div>
      </div>

      <div className="field mt-5">
        <div className="control">
          <button
            type="submit"
            className={`button is-primary is-fullwidth ${isLoading ? 'is-loading' : ''}`}
            disabled={isLoading}
          >
            Login
          </button>
        </div>
      </div>
    </form>
  );
}

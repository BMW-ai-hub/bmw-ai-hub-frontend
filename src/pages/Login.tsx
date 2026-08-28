import { useState } from 'react';
import type { User } from '../types';
import { login } from '../api';
import { Button } from '../components/ui/Button';
import { Labelled } from '../components/ui/Controls';
import { Notice } from '../components/ui/Panel';

interface Props {
  onLogin: (user: User) => void;
}

const DEMO_ACCOUNTS = [
  { role: 'Technician', email: 'michael.thompson@bmwdealer.test' },
  { role: 'Manager', email: 'manager@bmwdealer.test' },
  { role: 'Administrator', email: 'admin@bmwdealer.test' },
];

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      onLogin(await login(email, password));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign in');
      setLoading(false);
    }
  };

  return (
    <div className="grid h-full grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,44%)_minmax(0,1fr)]">
      {/* ── Brand panel ─────────────────────────────────────────────── */}
      <aside className="relative hidden items-center bg-ink p-12 text-paper lg:flex">
        <div className="w-full">
          <p className="eyebrow !text-paper/45">AI Inspection Hub</p>
          <h1 className="mt-5 font-display text-display text-balance">
            Every walkaround, graded to the same standard.
          </h1>
          <p className="mt-6 max-w-md text-lead text-paper/60">
            Upload the customer walkaround, get a rubric score in minutes, and release only the
            videos that clear the quality gate.
          </p>
        </div>

        <p className="absolute bottom-12 left-12 text-micro font-bold tracking-[0.16em] text-paper/40 uppercase">
          NetSol Technologies
        </p>
      </aside>

      {/* ── Form ────────────────────────────────────────────────────── */}
      <main className="flex items-center justify-center bg-canvas px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-title">Sign in</h2>
          <p className="mt-2 text-lead font-medium text-ink-500">
            Use your dealership account to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-9 space-y-5">
            <Labelled label="Email" htmlFor="email">
              <div className="well flex h-11 items-center px-3.5">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@bmwdealer.com"
                  className="min-w-0 flex-1 bg-transparent font-semibold outline-none"
                />
              </div>
            </Labelled>

            <Labelled label="Password" htmlFor="password">
              <div className="well flex h-11 items-center px-3.5">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="min-w-0 flex-1 bg-transparent font-semibold outline-none"
                />
              </div>
            </Labelled>

            {error && <Notice tone="fail">{error}</Notice>}

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-10 border-t border-line pt-6">
            <p className="eyebrow">Demo accounts</p>
            <dl className="mt-3 space-y-1.5">
              {DEMO_ACCOUNTS.map((account) => (
                <div key={account.email} className="flex items-baseline justify-between gap-4">
                  <dt className="text-cell font-bold text-ink-600">{account.role}</dt>
                  <dd className="truncate text-cell text-ink-400">{account.email}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-cell text-ink-400">
              Password <span className="font-bold text-ink-600">bmw</span> for all accounts.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

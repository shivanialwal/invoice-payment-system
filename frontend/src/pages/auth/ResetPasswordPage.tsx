import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/client';
import './auth.css';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">InvoicePay</div>
          <div className="auth-error">Invalid or missing reset token. Please request a new reset link.</div>
          <div className="auth-footer"><Link to="/forgot-password">Request reset link</Link></div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      navigate('/login', { state: { message: 'Password reset successfully. Please sign in.' } });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">InvoicePay</div>
        <h1>Reset password</h1>
        <p className="subtitle">Choose a new password for your account</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="password">New password <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(min 8 characters)</span></label>
            <input id="password" type="password" required autoFocus value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="auth-field">
            <label htmlFor="confirm">Confirm password</label>
            <input id="confirm" type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading} style={{ marginTop: '0.75rem' }}>
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login">← Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}

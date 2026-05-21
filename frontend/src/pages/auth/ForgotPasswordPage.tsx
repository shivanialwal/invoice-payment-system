import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/client';
import './auth.css';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">InvoicePay</div>
        <h1>Forgot password</h1>
        <p className="subtitle">Enter your email and we'll send a reset link</p>

        {submitted ? (
          <div className="auth-success">
            If that email is registered, a reset link has been sent. Check your inbox.
            <br /><br />
            <small style={{ color: 'var(--text-muted)' }}>
              During development, check the Spring Boot console for the reset link.
            </small>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/login">← Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}

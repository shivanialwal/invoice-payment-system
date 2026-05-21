import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const nav = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/invoices', label: 'Invoices', end: false },
  { to: '/invoices/new', label: 'New invoice', end: false },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">IP</span>
          <div>
            <strong>InvoicePay</strong>
            <span className="brand-sub">Payment system</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          {user && (
            <div style={{ marginBottom: '0.75rem' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>{user.name}</p>
              <p style={{ margin: '0.1rem 0 0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</p>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem' }}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

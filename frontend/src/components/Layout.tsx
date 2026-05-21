import { NavLink, Outlet } from 'react-router-dom';
import './Layout.css';

const nav = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/invoices', label: 'Invoices', end: false },
  { to: '/invoices/new', label: 'New invoice', end: false },
];

export function Layout() {
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
          <span className="mock-badge">Mock data</span>
          <p>Backend API at <code>/api</code> when Spring Boot is running.</p>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

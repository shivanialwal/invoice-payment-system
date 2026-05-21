import './StatCard.css';

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  variant?: 'default' | 'paid' | 'pending' | 'overdue';
}

export function StatCard({ label, value, hint, variant = 'default' }: StatCardProps) {
  return (
    <div className={`stat-card stat-${variant}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  );
}

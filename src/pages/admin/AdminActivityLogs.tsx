export default function AdminActivityLogs() {
  return (
    <div>
      <h1 className="h2" style={{ marginBottom: 'var(--spacing-6)' }}>Activity Logs</h1>
      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-8)', textAlign: 'center', border: '1px solid var(--color-border)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>No activity logs available.</p>
      </div>
    </div>
  );
}

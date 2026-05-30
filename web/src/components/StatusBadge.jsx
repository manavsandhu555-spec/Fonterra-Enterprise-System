const config = {
  Approved: {
    bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0',
    dot: '#10b981', label: 'Approved',
  },
  QualityRejected: {
    bg: '#fffbeb', color: '#78350f', border: '#fde68a',
    dot: '#f59e0b', label: 'Rejected',
  },
  Quarantined: {
    bg: '#fef2f2', color: '#7f1d1d', border: '#fecaca',
    dot: '#ef4444', label: 'Quarantined',
  },
  Pending: {
    bg: '#f8fafc', color: '#475569', border: '#e2e8f0',
    dot: '#94a3b8', label: 'Pending',
  },
}

export default function StatusBadge({ status }) {
  const c = config[status] ?? config.Pending
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 99,
      fontSize: 11.5, fontWeight: 600, letterSpacing: '0.01em',
      background: c.bg, color: c.color,
      border: `1px solid ${c.border}`,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%',
        background: c.dot, flexShrink: 0,
      }} />
      {c.label}
    </span>
  )
}

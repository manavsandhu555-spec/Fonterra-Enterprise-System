function formatDate(ts) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleString('en-NZ', { dateStyle: 'medium', timeStyle: 'short' })
}

const EVENT = {
  APPROVED: {
    dot: '#10b981', dotBg: '#ecfdf5', dotBorder: '#a7f3d0',
    label: 'Approved', labelColor: '#065f46', labelBg: '#ecfdf5', labelBorder: '#a7f3d0',
    icon: (
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
        <path d="M2 5.5l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  QUALITY_REJECTED: {
    dot: '#f59e0b', dotBg: '#fffbeb', dotBorder: '#fde68a',
    label: 'Quality Rejected', labelColor: '#78350f', labelBg: '#fffbeb', labelBorder: '#fde68a',
    icon: (
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
        <path d="M5.5 2v4M5.5 8v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  SAFETY_BREACH: {
    dot: '#ef4444', dotBg: '#fef2f2', dotBorder: '#fecaca',
    label: 'Safety Breach', labelColor: '#7f1d1d', labelBg: '#fef2f2', labelBorder: '#fecaca',
    icon: (
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
        <path d="M5.5 1.5L10 9.5H1L5.5 1.5z" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
        <path d="M5.5 4.5v2M5.5 7.5v.3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
}

function getEvent(type) {
  return EVENT[type] ?? {
    dot: '#94a3b8', dotBg: '#f8fafc', dotBorder: '#e2e8f0',
    label: type, labelColor: '#475569', labelBg: '#f8fafc', labelBorder: '#e2e8f0',
    icon: <span style={{ color: 'white', fontSize: 9 }}>•</span>,
  }
}

function EmptyState() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.9)', border: '1px solid var(--border)',
      borderRadius: 16, padding: '64px 32px', textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: '#f8fafc', border: '1px solid var(--border)',
        margin: '0 auto 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--text-3)' }}>
          <path d="M9 12h6M9 16h4M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4h6v4H9V4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>No audit events yet</div>
      <div style={{ fontSize: 13.5, color: 'var(--text-3)' }}>Events appear here as batches are submitted and validated</div>
    </div>
  )
}

export default function AuditLog({ events }) {
  if (events.length === 0) return <EmptyState />

  return (
    <div style={{
      background: 'rgba(255,255,255,0.92)', border: '1px solid var(--border)',
      borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px 12px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>
          {events.length} event{events.length !== 1 ? 's' : ''} · newest first
        </span>
      </div>

      {/* Timeline */}
      <div style={{ padding: '8px 0' }}>
        {events.map((e, i) => {
          const c = getEvent(e.eventType)
          const isLast = i === events.length - 1
          return (
            <div
              key={e.id}
              style={{
                display: 'flex', gap: 0, padding: '0 20px',
                transition: 'background 0.12s',
              }}
              onMouseEnter={el => { el.currentTarget.style.background = '#f8faff' }}
              onMouseLeave={el => { el.currentTarget.style.background = 'transparent' }}
            >
              {/* Timeline track */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 16, paddingTop: 16 }}>
                {/* Dot */}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: c.dot,
                  border: `3px solid ${c.dotBg}`,
                  boxShadow: `0 0 0 1px ${c.dotBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, zIndex: 1,
                }}>
                  {c.icon}
                </div>
                {/* Line */}
                {!isLast && (
                  <div style={{
                    width: 1.5, flex: 1, minHeight: 16,
                    background: 'linear-gradient(to bottom, #e2e8f0, transparent)',
                    marginTop: 4,
                  }} />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingTop: 13, paddingBottom: isLast ? 16 : 12 }}>
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                    background: c.labelBg, color: c.labelColor, border: `1px solid ${c.labelBorder}`,
                    letterSpacing: '0.03em',
                  }}>
                    {c.label}
                  </span>
                  <span style={{
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: 11.5, fontWeight: 700,
                    background: '#eef2ff', color: '#4f46e5',
                    padding: '2px 7px', borderRadius: 5,
                  }}>
                    {e.batchId}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{e.farmSource}</span>
                  <span style={{
                    fontSize: 11, padding: '2px 7px', borderRadius: 99,
                    background: e.batchType === 'Organic' ? '#ecfdf5' : '#eff6ff',
                    color: e.batchType === 'Organic' ? '#065f46' : '#1e40af',
                    border: `1px solid ${e.batchType === 'Organic' ? '#a7f3d0' : '#bfdbfe'}`,
                    fontWeight: 600,
                  }}>
                    {e.batchType}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                    {formatDate(e.timestamp)}
                  </span>
                </div>
                {/* Message */}
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55 }}>{e.message}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

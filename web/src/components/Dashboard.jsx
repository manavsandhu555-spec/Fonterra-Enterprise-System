import { useMemo } from 'react'
import { BatchStatus } from '../lib/validation'

const cards = [
  {
    key: 'total',
    label: 'Total Batches',
    accent: '#6366f1',
    accentBg: '#eef2ff',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6 5V4a2 2 0 012-2h4a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'approved',
    label: 'Approved',
    accent: '#10b981',
    accentBg: '#ecfdf5',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'rejected',
    label: 'Quality Rejected',
    accent: '#f59e0b',
    accentBg: '#fffbeb',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 3L18 17H2L10 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M10 9v3M10 14.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'quarantined',
    label: 'Quarantined',
    accent: '#ef4444',
    accentBg: '#fef2f2',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2l8 4v4c0 5-3.5 8-8 9C5.5 18 2 15 2 10V6l8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M10 7v4M10 13v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'totalVolume',
    label: 'Total Volume',
    accent: '#3b82f6',
    accentBg: '#eff6ff',
    suffix: 'L',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2C7.5 5 4 8 4 12a6 6 0 0012 0c0-4-3.5-7-6-10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M7.5 14a3.5 3.5 0 004.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'approvalRate',
    label: 'Approval Rate',
    accent: '#8b5cf6',
    accentBg: '#f5f3ff',
    suffix: '%',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 10V6M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

function StatCard({ card, value, total }) {
  const pct = card.key === 'approvalRate' ? parseFloat(value) : (total > 0 && typeof value === 'number' ? null : null)

  return (
    <div
      className="animate-fade-up"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        borderRadius: 14,
        border: '1px solid rgba(226,232,240,0.9)',
        padding: '20px 20px 18px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08), 0 12px 24px rgba(0,0,0,0.06)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: card.accent, borderRadius: '14px 0 0 14px',
      }} />

      {/* Icon */}
      <div style={{
        width: 36, height: 36, borderRadius: 9,
        background: card.accentBg,
        color: card.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
      }}>
        {card.icon}
      </div>

      {/* Value */}
      <div style={{
        fontSize: 28, fontWeight: 800, color: 'var(--text-1)',
        letterSpacing: '-0.8px', lineHeight: 1, marginBottom: 4,
      }}>
        {card.key === 'totalVolume'
          ? (typeof value === 'number' ? value.toLocaleString() : value)
          : value}
        {card.suffix && (
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-2)', marginLeft: 2 }}>
            {card.suffix}
          </span>
        )}
      </div>

      {/* Label */}
      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)', letterSpacing: '0.01em' }}>
        {card.label}
      </div>

      {/* Approval rate bar */}
      {card.key === 'approvalRate' && (
        <div style={{ marginTop: 10, height: 3, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${Math.min(parseFloat(value), 100)}%`,
            background: parseFloat(value) >= 75 ? '#10b981' : parseFloat(value) >= 50 ? '#f59e0b' : '#ef4444',
            borderRadius: 99, transition: 'width 0.6s ease',
          }} />
        </div>
      )}
    </div>
  )
}

export default function Dashboard({ batches }) {
  const stats = useMemo(() => {
    const total = batches.length
    const approved = batches.filter(b => b.status === BatchStatus.APPROVED).length
    const rejected = batches.filter(b => b.status === BatchStatus.QUALITY_REJECTED).length
    const quarantined = batches.filter(b => b.status === BatchStatus.QUARANTINED).length
    const totalVolume = batches.reduce((s, b) => s + (b.volumeLiters || 0), 0)
    const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(1) : '0.0'
    return { total, approved, rejected, quarantined, totalVolume, approvalRate }
  }, [batches])

  const values = {
    total: stats.total,
    approved: stats.approved,
    rejected: stats.rejected,
    quarantined: stats.quarantined,
    totalVolume: stats.totalVolume,
    approvalRate: stats.approvalRate,
  }

  return (
    <div className="stagger" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: 14,
      marginBottom: 28,
    }}>
      {cards.map(card => (
        <StatCard key={card.key} card={card} value={values[card.key]} total={stats.total} />
      ))}
    </div>
  )
}

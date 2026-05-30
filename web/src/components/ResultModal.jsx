import { EventType } from '../lib/validation'

const config = {
  [EventType.APPROVED]: {
    gradient: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
    iconGradient: 'linear-gradient(135deg, #34d399, #10b981)',
    iconShadow: '0 4px 16px rgba(16,185,129,0.4)',
    title: 'Batch Approved',
    titleColor: '#065f46',
    border: '#a7f3d0',
    accentLine: '#10b981',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M6 14l5.5 5.5 10.5-11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  [EventType.QUALITY_REJECTED]: {
    gradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    iconGradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    iconShadow: '0 4px 16px rgba(245,158,11,0.4)',
    title: 'Quality Rejected',
    titleColor: '#78350f',
    border: '#fde68a',
    accentLine: '#f59e0b',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 8v8M14 18.5v1" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  [EventType.SAFETY_BREACH]: {
    gradient: 'linear-gradient(135deg, #fff1f2 0%, #fee2e2 100%)',
    iconGradient: 'linear-gradient(135deg, #f87171, #ef4444)',
    iconShadow: '0 4px 16px rgba(239,68,68,0.4)',
    title: 'Safety Breach — Quarantined',
    titleColor: '#7f1d1d',
    border: '#fecaca',
    accentLine: '#ef4444',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 5L25 22H3L14 5z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M14 11v5M14 18v1.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
}

export default function ResultModal({ result, onClose }) {
  const c = config[result.eventType] ?? config[EventType.APPROVED]

  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(15,23,42,0.6)',
        backdropFilter: 'blur(8px)',
        padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="animate-scale-in"
        style={{
          width: '100%', maxWidth: 380,
          borderRadius: 22,
          border: `1px solid ${c.border}`,
          background: c.gradient,
          boxShadow: '0 24px 48px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.5) inset',
          overflow: 'hidden',
        }}
      >
        {/* Top accent line */}
        <div style={{ height: 4, background: c.accentLine, width: '100%' }} />

        {/* Body */}
        <div style={{ padding: '32px 28px 24px', textAlign: 'center' }}>
          {/* Icon */}
          <div style={{
            width: 64, height: 64,
            background: c.iconGradient,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: c.iconShadow,
          }}>
            {c.icon}
          </div>

          <h3 style={{
            fontSize: 20, fontWeight: 800,
            color: c.titleColor, letterSpacing: '-0.4px',
            marginBottom: 10,
          }}>
            {c.title}
          </h3>

          <p style={{
            fontSize: 14, color: '#374151',
            lineHeight: 1.65, maxWidth: 300, margin: '0 auto',
          }}>
            {result.message}
          </p>
        </div>

        {/* Footer */}
        <div style={{ padding: '0 24px 24px' }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.08)',
              border: 'none', borderRadius: 11,
              padding: '12px', fontSize: 14, fontWeight: 700,
              color: c.titleColor, cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.14)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.08)' }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import BatchList from './components/BatchList'
import BatchForm from './components/BatchForm'
import AuditLog from './components/AuditLog'
import ResultModal from './components/ResultModal'
import { subscribeToBatches, subscribeToAuditLog } from './lib/batchService'
import { BatchStatus } from './lib/validation'

const FILTERS = ['All', BatchStatus.APPROVED, BatchStatus.QUALITY_REJECTED, BatchStatus.QUARANTINED, BatchStatus.PENDING]
const FILTER_LABELS = {
  All: 'All',
  Approved: 'Approved',
  QualityRejected: 'Rejected',
  Quarantined: 'Quarantined',
  Pending: 'Pending',
}
const FILTER_COLORS = {
  All: '',
  Approved: 'data-[active=true]:bg-emerald-600 data-[active=true]:border-emerald-600',
  QualityRejected: 'data-[active=true]:bg-amber-500 data-[active=true]:border-amber-500',
  Quarantined: 'data-[active=true]:bg-red-600 data-[active=true]:border-red-600',
  Pending: 'data-[active=true]:bg-slate-600 data-[active=true]:border-slate-600',
}

const TABS = ['Batches', 'Audit Log']

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function LogoMark() {
  return (
    <div style={{
      width: 34,
      height: 34,
      borderRadius: 10,
      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #3730a3 100%)',
      boxShadow: '0 2px 8px rgba(79,70,229,0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2C5.13 2 2 5.13 2 9s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 2.5a2 2 0 110 4 2 2 0 010-4zm0 9.5a5 5 0 01-4-2c.02-1.33 2.67-2.06 4-2.06s3.98.73 4 2.06a5 5 0 01-4 2z" fill="white"/>
      </svg>
    </div>
  )
}

export default function App() {
  const [batches, setBatches] = useState([])
  const [auditEvents, setAuditEvents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const [filter, setFilter] = useState('All')
  const [tab, setTab] = useState('Batches')

  useEffect(() => {
    const unsub1 = subscribeToBatches(setBatches)
    const unsub2 = subscribeToAuditLog(setAuditEvents)
    return () => { unsub1(); unsub2() }
  }, [])

  function handleSubmitted(result) {
    setShowForm(false)
    setLastResult(result)
  }

  const batchCountByStatus = (s) => s === 'All' ? batches.length : batches.filter(b => b.status === s).length

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ── Navigation ─────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(226,232,240,0.8)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LogoMark />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.3px', lineHeight: 1 }}>
                Fonterra QA
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, lineHeight: 1, letterSpacing: '0.02em' }}>
                Milk Batch Quality Platform
              </div>
            </div>
          </div>

          {/* Nav right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>
              {batches.length} batch{batches.length !== 1 ? 'es' : ''} total
            </div>
            <button
              onClick={() => setShowForm(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white', border: 'none', borderRadius: 9,
                padding: '8px 16px', fontSize: 13.5, fontWeight: 600,
                cursor: 'pointer', letterSpacing: '-0.1px',
                boxShadow: '0 1px 2px rgba(79,70,229,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #4f46e5, #3730a3)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,70,229,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1, #4f46e5)'
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(79,70,229,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <PlusIcon />
              New Batch
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────── */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Page header */}
        <div style={{ marginBottom: 28 }} className="animate-fade-up">
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.5px', marginBottom: 4 }}>
            Quality Dashboard
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
            Monitor milk batch collection quality in real time
          </p>
        </div>

        {/* Stats */}
        <Dashboard batches={batches} />

        {/* Tab + filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          {/* Tabs */}
          <div style={{
            display: 'inline-flex', gap: 2,
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid var(--border)',
            borderRadius: 10, padding: 4,
            backdropFilter: 'blur(8px)',
          }}>
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '6px 18px', borderRadius: 7, border: 'none',
                  fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: tab === t ? 'var(--brand)' : 'transparent',
                  color: tab === t ? 'white' : 'var(--text-2)',
                  boxShadow: tab === t ? '0 1px 3px rgba(79,70,229,0.3)' : 'none',
                }}
              >
                {t}
                {t === 'Audit Log' && auditEvents.length > 0 && (
                  <span style={{
                    marginLeft: 6, background: tab === t ? 'rgba(255,255,255,0.25)' : 'var(--brand-light)',
                    color: tab === t ? 'white' : 'var(--brand)',
                    borderRadius: 99, padding: '0 6px', fontSize: 11, fontWeight: 700,
                  }}>
                    {auditEvents.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Filter chips */}
          {tab === 'Batches' && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {FILTERS.map((f) => {
                const active = filter === f
                const count = batchCountByStatus(f)
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '5px 12px', borderRadius: 8, border: '1px solid',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: active ? (f === 'Approved' ? '#10b981' : f === 'QualityRejected' ? '#f59e0b' : f === 'Quarantined' ? '#ef4444' : f === 'Pending' ? '#64748b' : 'var(--text-1)') : 'rgba(255,255,255,0.8)',
                      borderColor: active ? 'transparent' : 'var(--border)',
                      color: active ? 'white' : 'var(--text-2)',
                      boxShadow: active ? '0 1px 4px rgba(0,0,0,0.15)' : 'var(--shadow-sm)',
                    }}
                  >
                    {FILTER_LABELS[f]}
                    <span style={{
                      background: active ? 'rgba(255,255,255,0.25)' : 'var(--surface-3)',
                      color: active ? 'white' : 'var(--text-3)',
                      borderRadius: 99, padding: '0 5px', fontSize: 10.5, fontWeight: 700,
                      minWidth: 18, textAlign: 'center',
                    }}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="animate-fade-up" key={tab} style={{ animationDelay: '50ms' }}>
          {tab === 'Batches' ? (
            <BatchList batches={batches} filter={filter} onNew={() => setShowForm(true)} />
          ) : (
            <AuditLog events={auditEvents} />
          )}
        </div>
      </main>

      {showForm && (
        <BatchForm onClose={() => setShowForm(false)} onSubmitted={handleSubmitted} />
      )}
      {lastResult && (
        <ResultModal result={lastResult} onClose={() => setLastResult(null)} />
      )}
    </div>
  )
}

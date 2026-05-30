import StatusBadge from './StatusBadge'

function formatDate(ts) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleString('en-NZ', { dateStyle: 'medium', timeStyle: 'short' })
}

function EmptyState({ filter, onNew }) {
  const isFiltered = filter !== 'All'
  return (
    <div style={{
      background: 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(8px)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: '64px 32px',
      textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: 'var(--brand-light)',
        margin: '0 auto 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ color: 'var(--brand)' }}>
          <path d="M14 4C9.58 4 6 7.58 6 12c0 6 8 14 8 14s8-8 8-14c0-4.42-3.58-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2"/>
        </svg>
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>
        {isFiltered ? `No ${filter.toLowerCase()} batches` : 'No batches yet'}
      </div>
      <div style={{ fontSize: 13.5, color: 'var(--text-2)', marginBottom: 24, lineHeight: 1.5 }}>
        {isFiltered
          ? 'Try a different filter or submit a new batch'
          : 'Submit your first batch to start tracking quality metrics'}
      </div>
      {!isFiltered && (
        <button
          onClick={onNew}
          style={{
            background: 'var(--brand)', color: 'white',
            border: 'none', borderRadius: 9,
            padding: '10px 22px', fontSize: 13.5, fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
          }}
        >
          Submit First Batch
        </button>
      )}
    </div>
  )
}

const COL_HEADERS = [
  { label: 'Batch ID', width: 110 },
  { label: 'Farm Source' },
  { label: 'Type', width: 100 },
  { label: 'Volume (L)', width: 110, align: 'right' },
  { label: 'Temp (°C)', width: 100, align: 'right' },
  { label: 'Fat %', width: 80, align: 'right' },
  { label: 'Collected', width: 170 },
  { label: 'Status', width: 130 },
]

export default function BatchList({ batches, filter, onNew }) {
  const filtered = filter === 'All' ? batches : batches.filter(b => b.status === filter)

  if (filtered.length === 0) return <EmptyState filter={filter} onNew={onNew} />

  return (
    <div style={{
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(8px)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
    }}>
      {/* Table header info bar */}
      <div style={{
        padding: '14px 20px 12px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>
          {filtered.length} batch{filtered.length !== 1 ? 'es' : ''}
          {filter !== 'All' && <span style={{ color: 'var(--text-3)', fontWeight: 400 }}> · filtered by {filter}</span>}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: '#fafbfc' }}>
              {COL_HEADERS.map(h => (
                <th key={h.label} style={{
                  padding: '10px 16px',
                  textAlign: h.align ?? 'left',
                  fontSize: 11, fontWeight: 700,
                  color: 'var(--text-3)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  whiteSpace: 'nowrap',
                  borderBottom: '1px solid var(--border)',
                  width: h.width,
                }}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((b, i) => (
              <TableRow key={b.id} batch={b} isLast={i === filtered.length - 1} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TableRow({ batch: b, isLast }) {
  const tempOver = b.temperature > 6
  const fatUnder = b.fatPercentage < 3.5

  return (
    <tr
      style={{
        borderBottom: isLast ? 'none' : '1px solid #f1f5f9',
        transition: 'background 0.12s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#f8faff' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      {/* Batch ID */}
      <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
        <span style={{
          fontFamily: 'ui-monospace, monospace',
          fontSize: 12.5, fontWeight: 700,
          color: '#4f46e5',
          background: '#eef2ff',
          padding: '2px 8px', borderRadius: 5,
          letterSpacing: '0.02em',
        }}>
          {b.batchId}
        </span>
      </td>

      {/* Farm Source */}
      <td style={{ padding: '13px 16px', fontWeight: 500, color: 'var(--text-1)' }}>
        {b.farmSource}
      </td>

      {/* Type */}
      <td style={{ padding: '13px 16px' }}>
        <span style={{
          fontSize: 11.5, fontWeight: 600,
          padding: '3px 9px', borderRadius: 99,
          background: b.type === 'Organic' ? '#ecfdf5' : '#eff6ff',
          color: b.type === 'Organic' ? '#065f46' : '#1e40af',
          border: `1px solid ${b.type === 'Organic' ? '#a7f3d0' : '#bfdbfe'}`,
        }}>
          {b.type === 'Organic' ? '🌿 Organic' : 'Standard'}
        </span>
      </td>

      {/* Volume */}
      <td style={{ padding: '13px 16px', textAlign: 'right', fontWeight: 500, color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>
        {b.volumeLiters?.toLocaleString()}
      </td>

      {/* Temp */}
      <td style={{ padding: '13px 16px', textAlign: 'right' }}>
        <span style={{
          fontWeight: 600,
          color: tempOver ? '#dc2626' : 'var(--text-2)',
          background: tempOver ? '#fef2f2' : 'transparent',
          padding: tempOver ? '2px 6px' : undefined,
          borderRadius: tempOver ? 4 : undefined,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {b.temperature}°C
        </span>
      </td>

      {/* Fat % */}
      <td style={{ padding: '13px 16px', textAlign: 'right' }}>
        <span style={{
          fontWeight: 600,
          color: fatUnder ? '#d97706' : 'var(--text-2)',
          background: fatUnder ? '#fffbeb' : 'transparent',
          padding: fatUnder ? '2px 6px' : undefined,
          borderRadius: fatUnder ? 4 : undefined,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {b.fatPercentage}%
        </span>
      </td>

      {/* Collected */}
      <td style={{ padding: '13px 16px', color: 'var(--text-3)', fontSize: 12.5, whiteSpace: 'nowrap' }}>
        {formatDate(b.collectionTime)}
      </td>

      {/* Status */}
      <td style={{ padding: '13px 16px' }}>
        <StatusBadge status={b.status} />
      </td>
    </tr>
  )
}

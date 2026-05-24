function formatDate(ts) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleString()
}

const eventConfig = {
  APPROVED: { bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500', text: 'text-green-800', icon: '✓' },
  QUALITY_REJECTED: { bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'bg-yellow-500', text: 'text-yellow-800', icon: '!' },
  SAFETY_BREACH: { bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', text: 'text-red-800', icon: '⚠' },
}

function getConfig(eventType) {
  return eventConfig[eventType] ?? { bg: 'bg-slate-50', border: 'border-slate-200', dot: 'bg-slate-400', text: 'text-slate-700', icon: '•' }
}

export default function AuditLog({ events }) {
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400 shadow-sm">
        <p className="text-4xl mb-3">📋</p>
        <p className="font-medium">No audit events yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {events.map((e) => {
        const c = getConfig(e.eventType)
        return (
          <div key={e.id} className={`flex gap-4 items-start p-4 rounded-xl border ${c.bg} ${c.border}`}>
            <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${c.dot} shrink-0`}>
              {c.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className={`text-xs font-bold uppercase tracking-wide ${c.text}`}>{e.eventType.replace('_', ' ')}</span>
                <span className="font-mono text-xs text-slate-600 bg-white/70 px-1.5 py-0.5 rounded">{e.batchId}</span>
                <span className="text-xs text-slate-500">{e.farmSource}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${e.batchType === 'Organic' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {e.batchType}
                </span>
              </div>
              <p className="text-sm text-slate-700">{e.message}</p>
            </div>
            <p className="text-xs text-slate-400 whitespace-nowrap shrink-0">{formatDate(e.timestamp)}</p>
          </div>
        )
      })}
    </div>
  )
}

import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import BatchList from './components/BatchList'
import BatchForm from './components/BatchForm'
import AuditLog from './components/AuditLog'
import ResultModal from './components/ResultModal'
import { subscribeToBatches, subscribeToAuditLog } from './lib/batchService'
import { BatchStatus } from './lib/validation'

const FILTERS = ['All', BatchStatus.APPROVED, BatchStatus.QUALITY_REJECTED, BatchStatus.QUARANTINED, BatchStatus.PENDING]
const FILTER_LABELS = { All: 'All', Approved: 'Approved', QualityRejected: 'Rejected', Quarantined: 'Quarantined', Pending: 'Pending' }

const TABS = ['Batches', 'Audit Log']

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

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Nav */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">F</div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-none">Fonterra QA</h1>
              <p className="text-xs text-slate-400 leading-none mt-0.5">Milk Batch Quality Platform</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
          >
            <span className="text-lg leading-none">+</span>
            Submit Batch
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <Dashboard batches={batches} />

        {/* Tab bar */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${tab === t ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'Batches' && (
            <div className="flex gap-1 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${filter === f ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                >
                  {FILTER_LABELS[f] ?? f}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        {tab === 'Batches' ? (
          <BatchList batches={batches} filter={filter} />
        ) : (
          <AuditLog events={auditEvents} />
        )}
      </main>

      {showForm && (
        <BatchForm
          onClose={() => setShowForm(false)}
          onSubmitted={handleSubmitted}
        />
      )}

      {lastResult && (
        <ResultModal result={lastResult} onClose={() => setLastResult(null)} />
      )}
    </div>
  )
}

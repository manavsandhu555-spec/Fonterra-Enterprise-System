import { EventType } from '../lib/validation'

const config = {
  [EventType.APPROVED]: {
    icon: '✓',
    iconBg: 'bg-green-100',
    iconText: 'text-green-600',
    title: 'Batch Approved',
    titleText: 'text-green-800',
    border: 'border-green-200',
  },
  [EventType.QUALITY_REJECTED]: {
    icon: '!',
    iconBg: 'bg-yellow-100',
    iconText: 'text-yellow-600',
    title: 'Quality Rejected',
    titleText: 'text-yellow-800',
    border: 'border-yellow-200',
  },
  [EventType.SAFETY_BREACH]: {
    icon: '⚠',
    iconBg: 'bg-red-100',
    iconText: 'text-red-600',
    title: 'Safety Breach — Quarantined',
    titleText: 'text-red-800',
    border: 'border-red-200',
  },
}

export default function ResultModal({ result, onClose }) {
  const c = config[result.eventType] ?? config[EventType.APPROVED]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-sm border-2 ${c.border}`}>
        <div className="p-6 text-center">
          <div className={`mx-auto w-14 h-14 rounded-full ${c.iconBg} flex items-center justify-center text-2xl font-bold ${c.iconText} mb-4`}>
            {c.icon}
          </div>
          <h3 className={`text-lg font-bold ${c.titleText} mb-2`}>{c.title}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{result.message}</p>
        </div>
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-lg py-2.5 text-sm font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

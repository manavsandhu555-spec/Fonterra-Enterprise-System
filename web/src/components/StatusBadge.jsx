const config = {
  Approved: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', label: 'Approved' },
  QualityRejected: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500', label: 'Quality Rejected' },
  Quarantined: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500', label: 'Quarantined' },
  Pending: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400', label: 'Pending' },
}

export default function StatusBadge({ status }) {
  const c = config[status] ?? config.Pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}

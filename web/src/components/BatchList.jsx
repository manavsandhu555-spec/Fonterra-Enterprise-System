import StatusBadge from './StatusBadge'

function formatDate(ts) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleString()
}

export default function BatchList({ batches, filter }) {
  const filtered = filter === 'All' ? batches : batches.filter((b) => b.status === filter)

  if (filtered.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400 shadow-sm">
        <p className="text-4xl mb-3">🥛</p>
        <p className="font-medium">No batches yet</p>
        <p className="text-sm mt-1">Submit a batch using the button above</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Batch ID', 'Farm Source', 'Type', 'Volume (L)', 'Temp (°C)', 'Fat %', 'Collected', 'Status'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3 font-mono font-semibold text-slate-800">{b.batchId}</td>
                <td className="px-4 py-3 text-slate-700">{b.farmSource}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${b.type === 'Organic' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {b.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700">{b.volumeLiters?.toLocaleString()}</td>
                <td className={`px-4 py-3 font-medium ${b.temperature > 6 ? 'text-red-600' : 'text-slate-700'}`}>
                  {b.temperature}°C
                </td>
                <td className={`px-4 py-3 font-medium ${b.fatPercentage < 3.5 ? 'text-yellow-600' : 'text-slate-700'}`}>
                  {b.fatPercentage}%
                </td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(b.collectionTime)}</td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

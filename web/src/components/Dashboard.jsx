import { useMemo } from 'react'
import { BatchStatus } from '../lib/validation'

function StatCard({ label, value, color }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm`}>
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

export default function Dashboard({ batches }) {
  const stats = useMemo(() => {
    const total = batches.length
    const approved = batches.filter((b) => b.status === BatchStatus.APPROVED).length
    const rejected = batches.filter((b) => b.status === BatchStatus.QUALITY_REJECTED).length
    const quarantined = batches.filter((b) => b.status === BatchStatus.QUARANTINED).length
    const totalVolume = batches.reduce((sum, b) => sum + (b.volumeLiters || 0), 0)
    const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(1) : '0.0'
    return { total, approved, rejected, quarantined, totalVolume, approvalRate }
  }, [batches])

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <StatCard label="Total Batches" value={stats.total} color="text-slate-800" />
      <StatCard label="Approved" value={stats.approved} color="text-green-600" />
      <StatCard label="Quality Rejected" value={stats.rejected} color="text-yellow-600" />
      <StatCard label="Quarantined" value={stats.quarantined} color="text-red-600" />
      <StatCard label="Total Volume (L)" value={stats.totalVolume.toLocaleString()} color="text-blue-600" />
      <StatCard label="Approval Rate" value={`${stats.approvalRate}%`} color="text-indigo-600" />
    </div>
  )
}

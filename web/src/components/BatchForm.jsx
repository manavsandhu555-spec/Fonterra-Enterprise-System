import { useState } from 'react'
import { submitBatch } from '../lib/batchService'
import { BatchType, THRESHOLDS } from '../lib/validation'

const defaultForm = {
  batchId: '',
  farmSource: '',
  volumeLiters: '',
  temperature: '',
  fatPercentage: '',
  type: BatchType.STANDARD,
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-slate-500 mb-1">{hint}</p>}
      {children}
    </div>
  )
}

const inputCls =
  'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'

export default function BatchForm({ onClose, onSubmitted }) {
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!form.batchId || !form.farmSource) {
      setError('Batch ID and Farm Source are required.')
      return
    }
    setLoading(true)
    try {
      const { result } = await submitBatch(form)
      onSubmitted(result)
    } catch (err) {
      setError(err?.message ?? 'Failed to save batch.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Submit New Milk Batch</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Batch ID" hint="e.g. B-007">
              <input
                className={inputCls}
                value={form.batchId}
                onChange={set('batchId')}
                placeholder="B-007"
                required
              />
            </Field>
            <Field label="Batch Type">
              <select className={inputCls} value={form.type} onChange={set('type')}>
                <option value={BatchType.STANDARD}>Standard</option>
                <option value={BatchType.ORGANIC}>Organic</option>
              </select>
            </Field>
          </div>

          <Field label="Farm Source" hint="e.g. Waikato-01">
            <input
              className={inputCls}
              value={form.farmSource}
              onChange={set('farmSource')}
              placeholder="Waikato-01"
              required
            />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Volume (L)" hint={`Min ${THRESHOLDS.MIN_VOLUME_LITERS.toLocaleString()}L`}>
              <input
                className={inputCls}
                type="number"
                step="0.1"
                min="0"
                value={form.volumeLiters}
                onChange={set('volumeLiters')}
                placeholder="5000"
                required
              />
            </Field>
            <Field label="Temperature (°C)" hint={`Max ${THRESHOLDS.MAX_TEMP_CELSIUS}°C`}>
              <input
                className={inputCls}
                type="number"
                step="0.1"
                value={form.temperature}
                onChange={set('temperature')}
                placeholder="4.5"
                required
              />
            </Field>
            <Field label="Fat %" hint={`Min ${THRESHOLDS.MIN_FAT_PERCENTAGE}%`}>
              <input
                className={inputCls}
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={form.fatPercentage}
                onChange={set('fatPercentage')}
                placeholder="3.8"
                required
              />
            </Field>
          </div>

          {/* Threshold reference */}
          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 space-y-1">
            <p className="font-medium text-slate-600 mb-1">Quality Thresholds</p>
            <p>🌡 Temperature ≤ {THRESHOLDS.MAX_TEMP_CELSIUS}°C — <span className="text-red-600 font-medium">critical (quarantine if exceeded)</span></p>
            <p>🥛 Fat content ≥ {THRESHOLDS.MIN_FAT_PERCENTAGE}% — quality rejection if below</p>
            <p>📦 Volume ≥ {THRESHOLDS.MIN_VOLUME_LITERS.toLocaleString()}L — quality rejection if below</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-300 text-slate-700 rounded-lg py-2 text-sm font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg py-2 text-sm font-medium transition"
            >
              {loading ? 'Validating...' : 'Submit & Validate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

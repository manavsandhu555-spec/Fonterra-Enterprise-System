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

const inputStyle = {
  width: '100%',
  border: '1.5px solid #e2e8f0',
  borderRadius: 9,
  padding: '9px 12px',
  fontSize: 14,
  fontFamily: 'inherit',
  color: 'var(--text-1)',
  background: '#fafbfc',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
  boxSizing: 'border-box',
}

function Input({ label, hint, badge, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)', letterSpacing: '0.01em' }}>
          {label}
        </label>
        {hint && (
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>{hint}</span>
        )}
        {badge && (
          <span style={{
            fontSize: 10.5, fontWeight: 700, padding: '1px 7px', borderRadius: 99,
            background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
          }}>
            {badge.label}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function focusInput(e) {
  e.target.style.borderColor = '#6366f1'
  e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'
  e.target.style.background = '#fff'
}
function blurInput(e) {
  e.target.style.borderColor = '#e2e8f0'
  e.target.style.boxShadow = 'none'
  e.target.style.background = '#fafbfc'
}

export default function BatchForm({ onClose, onSubmitted }) {
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!form.batchId.trim() || !form.farmSource.trim()) {
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
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(6px)',
        padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="animate-scale-in"
        style={{
          background: '#fff',
          borderRadius: 20,
          width: '100%', maxWidth: 500,
          boxShadow: '0 24px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.3px', marginBottom: 2 }}>
              Submit New Milk Batch
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
              Batch will be validated against QA thresholds immediately
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8,
              border: '1px solid #e2e8f0', background: '#f8fafc',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-3)',
              fontSize: 18, lineHeight: 1,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = 'var(--text-1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = 'var(--text-3)' }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Section: Identity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Batch ID" hint="e.g. B-007">
                <input
                  style={inputStyle}
                  value={form.batchId}
                  onChange={set('batchId')}
                  placeholder="B-007"
                  onFocus={focusInput} onBlur={blurInput}
                  required
                />
              </Input>
              <Input label="Batch Type">
                <select
                  style={inputStyle}
                  value={form.type}
                  onChange={set('type')}
                  onFocus={focusInput} onBlur={blurInput}
                >
                  <option value={BatchType.STANDARD}>Standard</option>
                  <option value={BatchType.ORGANIC}>🌿 Organic</option>
                </select>
              </Input>
            </div>

            <Input label="Farm Source" hint="e.g. Waikato-01">
              <input
                style={inputStyle}
                value={form.farmSource}
                onChange={set('farmSource')}
                placeholder="Waikato-01"
                onFocus={focusInput} onBlur={blurInput}
                required
              />
            </Input>

            {/* Section: Measurements */}
            <div>
              <div style={{
                fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
              }}>
                Quality Measurements
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <Input
                  label="Volume (L)"
                  badge={{ label: `≥${THRESHOLDS.MIN_VOLUME_LITERS.toLocaleString()}L`, bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' }}
                >
                  <input
                    style={inputStyle} type="number" step="0.1" min="0"
                    value={form.volumeLiters}
                    onChange={set('volumeLiters')}
                    placeholder="5000"
                    onFocus={focusInput} onBlur={blurInput}
                    required
                  />
                </Input>
                <Input
                  label="Temp (°C)"
                  badge={{ label: `≤${THRESHOLDS.MAX_TEMP_CELSIUS}°C`, bg: '#fef2f2', color: '#991b1b', border: '#fecaca' }}
                >
                  <input
                    style={inputStyle} type="number" step="0.1"
                    value={form.temperature}
                    onChange={set('temperature')}
                    placeholder="4.5"
                    onFocus={focusInput} onBlur={blurInput}
                    required
                  />
                </Input>
                <Input
                  label="Fat %"
                  badge={{ label: `≥${THRESHOLDS.MIN_FAT_PERCENTAGE}%`, bg: '#fffbeb', color: '#78350f', border: '#fde68a' }}
                >
                  <input
                    style={inputStyle} type="number" step="0.01" min="0" max="15"
                    value={form.fatPercentage}
                    onChange={set('fatPercentage')}
                    placeholder="3.8"
                    onFocus={focusInput} onBlur={blurInput}
                    required
                  />
                </Input>
              </div>
            </div>

            {/* Threshold legend */}
            <div style={{
              background: 'linear-gradient(135deg, #fafbff 0%, #f5f3ff 100%)',
              border: '1px solid #e0e7ff',
              borderRadius: 10, padding: '12px 14px',
              display: 'flex', flexDirection: 'column', gap: 5,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', marginBottom: 3, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Validation Rules
              </div>
              {[
                { icon: '🌡', text: `Temperature ≤ ${THRESHOLDS.MAX_TEMP_CELSIUS}°C`, note: 'CRITICAL — quarantine', noteColor: '#dc2626' },
                { icon: '🥛', text: `Fat content ≥ ${THRESHOLDS.MIN_FAT_PERCENTAGE}%`, note: 'quality rejection' },
                { icon: '📦', text: `Volume ≥ ${THRESHOLDS.MIN_VOLUME_LITERS.toLocaleString()}L`, note: 'quality rejection' },
              ].map(r => (
                <div key={r.text} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12 }}>
                  <span>{r.icon}</span>
                  <span style={{ color: 'var(--text-2)' }}>{r.text}</span>
                  <span style={{ fontSize: 11, color: r.noteColor ?? 'var(--text-3)', marginLeft: 'auto', fontWeight: 600 }}>
                    {r.note}
                  </span>
                </div>
              ))}
            </div>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 9, padding: '10px 14px',
                fontSize: 13, color: '#dc2626', fontWeight: 500,
                display: 'flex', gap: 8, alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 15 }}>⚠</span>
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '14px 24px 20px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex', gap: 10,
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, border: '1.5px solid #e2e8f0',
                background: '#fafbfc', color: 'var(--text-2)',
                borderRadius: 10, padding: '10px', fontSize: 13.5,
                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fafbfc'; e.currentTarget.style.borderColor = '#e2e8f0' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2,
                background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white', border: 'none',
                borderRadius: 10, padding: '10px',
                fontSize: 13.5, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                boxShadow: loading ? 'none' : '0 2px 8px rgba(79,70,229,0.35)',
                transition: 'all 0.15s',
                letterSpacing: '-0.1px',
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{
                    width: 14, height: 14, border: '2px solid rgba(255,255,255,0.35)',
                    borderTopColor: 'white', borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Validating…
                </span>
              ) : 'Submit & Validate'}
            </button>
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

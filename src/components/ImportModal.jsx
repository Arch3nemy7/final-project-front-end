import { useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'

// Modal for importing two already-trained StyleGAN2-ADA run directories
// (paths on the backend host) as a ready-to-generate run.
export default function ImportModal({ onClose }) {
  const { importModels } = useStore()
  const [gn, setGn] = useState('')
  const [gp, setGp] = useState('')
  const [name, setName] = useState('Imported generators')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const submit = () => {
    if (!gn.trim() || !gp.trim()) { setErr('Both directory paths are required.'); return }
    setBusy(true); setErr('')
    importModels(gn.trim(), gp.trim(), name.trim() || 'Imported generators')
      .then(() => onClose())
      .catch((e) => { setErr(String(e.message || e)); setBusy(false) })
  }

  const field = (label, value, set, placeholder) => (
    <label style={{ display: 'block', marginBottom: 13 }}>
      <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5b6677', marginBottom: 6 }}>{label}</span>
      <input value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '9px 11px', border: '1px solid #e6e9f0', borderRadius: 8, fontSize: 13, fontFamily: "'IBM Plex Mono',monospace" }} />
    </label>
  )

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(22,32,46,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, padding: '24px 26px', width: 560, maxWidth: '92vw', boxShadow: '0 12px 40px rgba(22,32,46,.25)' }}>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Import trained models</div>
        <div style={{ fontSize: 12.5, color: '#8a94a4', marginBottom: 18 }}>
          Paste the two StyleGAN2-ADA run directories (on the backend host). The latest checkpoint and sample grid from each are imported as a ready-to-generate run.
        </div>
        {field('Run name', name, setName, 'Imported generators')}
        {field('Gram-negative run directory', gn, setGn, 'D:\\…\\00001-gram_negative-auto1-resumeffhq256')}
        {field('Gram-positive run directory', gp, setGp, 'D:\\…\\00001-gram_positive-auto1-resumeffhq256')}
        {err && <div style={{ fontSize: 12.5, color: '#cc4040', marginBottom: 12 }}>{err}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
          <button onClick={onClose} style={{ fontSize: 13, fontWeight: 600, color: '#5b6677', background: '#fff', border: '1px solid #e6e9f0', borderRadius: 9, padding: '10px 16px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={submit} disabled={busy} style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: busy ? '#c7cdd8' : '#2563c9', border: 'none', borderRadius: 9, padding: '10px 18px', cursor: busy ? 'default' : 'pointer' }}>
            {busy ? 'Importing…' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  )
}

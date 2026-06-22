import { useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { palette } from '../store/data.js'
import { LIVE } from '../api/client.js'
import { resultsOf } from '../lib/results.js'
import { toTick } from '../lib/format.js'
import { IconModels, IconDownload, IconPlus } from '../components/icons.jsx'
import ImportModal from '../components/ImportModal.jsx'

export default function Models() {
  const { db } = useStore()
  const C = palette(db.settings.accent)
  const [importing, setImporting] = useState(false)
  const ids = db.order.filter((id) => db.runs[id].pipe.gnDone && db.runs[id].pipe.gpDone)

  const rows = []
  ids.forEach((id) => {
    const r = db.runs[id]
    const R = resultsOf(r)
    rows.push({ key: id + '-gn', title: 'Gram-negative generator', runName: r.name, fidText: R.gnBest, tickText: R.gnTick, accent: C.neg, soft: C.negSoft })
    rows.push({ key: id + '-gp', title: 'Gram-positive generator', runName: r.name, fidText: R.gpBest, tickText: R.gpTick, accent: C.pos, soft: C.posSoft })
  })

  const importBtn = LIVE && (
    <div onClick={() => setImporting(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 9, cursor: 'pointer', background: '#2563c9', color: '#fff', fontWeight: 600, fontSize: 13 }}>
      <IconPlus size={15} /> Import trained models
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: '#8a94a4' }}>Trained outside this machine? Import the run directories.</div>
        {importBtn}
      </div>

      {rows.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #d4dae4', borderRadius: 14, padding: 46, textAlign: 'center', color: '#8a94a4', fontSize: 14 }}>
          No trained generators yet. Train a model, or import one trained elsewhere.
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, overflow: 'hidden' }}>
          {rows.map((m) => (
        <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 20px', borderBottom: '1px solid #f2f4f8' }}>
          <div style={{ flex: 'none', width: 34, height: 34, borderRadius: 9, background: m.soft, color: m.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconModels size={17} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{m.title}</div>
            <div style={{ fontSize: 12, color: '#8a94a4' }}>{m.runName} · StyleGAN2-ADA 256²</div>
          </div>
          <div style={{ flex: 'none', textAlign: 'right', width: 80 }}>
            <div style={{ fontSize: 10, color: '#8a94a4' }}>best FID</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 600, color: m.accent }}>{m.fidText != null ? m.fidText : '—'}</div>
          </div>
          <div style={{ flex: 'none', textAlign: 'right', width: 80 }}>
            <div style={{ fontSize: 10, color: '#8a94a4' }}>checkpoint</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, fontWeight: 600 }}>tick {m.tickText != null ? toTick(m.tickText) : '—'}</div>
          </div>
          <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 13px', border: '1px solid #e6e9f0', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#16202e', cursor: 'pointer' }}>
            <IconDownload size={14} /> .pkl
          </div>
        </div>
          ))}
        </div>
      )}

      {importing && <ImportModal onClose={() => setImporting(false)} />}
    </div>
  )
}

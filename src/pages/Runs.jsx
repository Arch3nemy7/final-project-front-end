import { useStore } from '../store/StoreContext.jsx'
import { palette } from '../store/data.js'
import { statusOf, runFid, relDate } from '../lib/format.js'
import { IconTrash } from '../components/icons.jsx'

const COLS = '2fr 1.3fr 1fr 130px 80px 70px 40px'

export default function Runs() {
  const { db, navigate, createRun, deleteRun } = useStore()
  const C = palette(db.settings.accent)

  if (db.order.length === 0) {
    return (
      <div style={{ background: '#fff', border: '1px dashed #d4dae4', borderRadius: 14, padding: 46, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 6 }}>No runs yet</div>
        <div style={{ fontSize: 13.5, color: '#8a94a4', marginBottom: 18 }}>Start your first augmentation pipeline.</div>
        <div onClick={createRun} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 20px', borderRadius: 9, cursor: 'pointer', background: '#2563c9', color: '#fff', fontWeight: 600, fontSize: 13.5 }}>New run</div>
      </div>
    )
  }

  const head = (label, align) => (
    <div style={{ padding: align === 'right' ? '11px 12px' : '11px 20px', textAlign: align || 'left' }}>{label}</div>
  )

  return (
    <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: COLS, background: '#f8fafc', borderBottom: '1px solid #e6e9f0', fontSize: 10.5, fontWeight: 600, color: '#8a94a4', textTransform: 'uppercase', letterSpacing: '.05em' }}>
        {head('Run')}
        <div style={{ padding: '11px 12px' }}>Dataset</div>
        <div style={{ padding: '11px 12px' }}>Progress</div>
        <div style={{ padding: '11px 12px' }}>Status</div>
        <div style={{ padding: '11px 12px', textAlign: 'right' }}>Best FID</div>
        <div style={{ padding: '11px 12px', textAlign: 'right' }}>Updated</div>
        <div />
      </div>

      {db.order.map((id) => {
        const r = db.runs[id], p = r.pipe, st = statusOf(p, C)
        const dc = p.done.filter(Boolean).length
        const pct = Math.round((dc / 6) * 100) + '%'
        return (
          <div key={id} style={{ display: 'grid', gridTemplateColumns: COLS, borderBottom: '1px solid #f2f4f8', alignItems: 'center' }}>
            <div className="gs-row" onClick={() => navigate('/run/' + id)} style={{ padding: '14px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11 }}>
              <span style={{ flex: 'none', width: 9, height: 9, borderRadius: '50%', background: st.dot }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
              </div>
            </div>
            <div style={{ padding: '14px 12px', fontSize: 12.5, color: '#5b6677', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.dataset}</div>
            <div style={{ padding: '14px 12px' }}>
              <div style={{ height: 6, borderRadius: 4, background: '#eef1f6', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 4, background: '#2563c9', width: pct }} />
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: '#8a94a4', marginTop: 3 }}>{dc} / 6</div>
            </div>
            <div style={{ padding: '14px 12px' }}>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: st.bg, color: st.fg }}>{st.label}</span>
            </div>
            <div style={{ padding: '14px 12px', textAlign: 'right', fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, fontWeight: 600 }}>{runFid(p)}</div>
            <div style={{ padding: '14px 12px', textAlign: 'right', fontSize: 11, color: '#8a94a4' }}>{relDate(r.updatedAt)}</div>
            <div onClick={(e) => { e.stopPropagation(); deleteRun(id) }} title="Delete run" style={{ padding: '14px 8px', cursor: 'pointer', color: '#b9c0cc', display: 'flex', justifyContent: 'center' }}>
              <IconTrash size={15} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

import { useStore } from '../store/StoreContext.jsx'
import { palette } from '../store/data.js'
import { statusOf, runFid, relDate } from '../lib/format.js'
import { resultsOf } from '../lib/results.js'
import { IconPlus } from '../components/icons.jsx'

const statCard = (label, value, color) => (
  <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 13, padding: '17px 19px' }}>
    <div style={{ fontSize: 11, color: '#8a94a4', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 30, fontWeight: 600, marginTop: 6, color: color || '#16202e' }}>{value}</div>
  </div>
)

export default function Dashboard() {
  const { db, navigate, createRun } = useStore()
  const C = palette(db.settings.accent)

  const mdIds = db.order.filter((id) => db.runs[id].pipe.gnDone && db.runs[id].pipe.gpDone)
  const completeN = db.order.filter((id) => db.runs[id].pipe.feasDone).length
  const bestFids = mdIds.map((id) => resultsOf(db.runs[id]).gnBest).filter((v) => v != null)
  const statBestFid = bestFids.length ? Math.min(...bestFids) : '—'
  const recent = db.order.slice(0, 4)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 26 }}>
        {statCard('Total runs', db.order.length)}
        {statCard('Completed', completeN, C.ok)}
        {statCard('Best FID', statBestFid, C.primary)}
        {statCard('Generators', mdIds.length * 2)}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16 }}>Recent runs</div>
        <div onClick={() => navigate('/runs')} style={{ fontSize: 12.5, color: C.primary, fontWeight: 600, cursor: 'pointer' }}>View all →</div>
      </div>

      {db.order.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #d4dae4', borderRadius: 14, padding: 46, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 6 }}>No runs yet</div>
          <div style={{ fontSize: 13.5, color: '#8a94a4', marginBottom: 18 }}>Start your first augmentation pipeline.</div>
          <div onClick={createRun} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 20px', borderRadius: 9, cursor: 'pointer', background: '#2563c9', color: '#fff', fontWeight: 600, fontSize: 13.5 }}>
            <IconPlus size={16} /> New run
          </div>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, overflow: 'hidden' }}>
          {recent.map((id) => {
            const r = db.runs[id], p = r.pipe, st = statusOf(p, C)
            const dc = p.done.filter(Boolean).length
            const pct = Math.round((dc / p.done.length) * 100) + '%'
            return (
              <div key={id} className="gs-row" onClick={() => navigate('/run/' + id)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '15px 20px', borderBottom: '1px solid #f2f4f8', cursor: 'pointer' }}>
                <span style={{ flex: 'none', width: 9, height: 9, borderRadius: '50%', background: st.dot }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: '#8a94a4', marginTop: 1 }}>{r.dataset}</div>
                </div>
                <div style={{ flex: 'none', width: 120 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: '#8a94a4', marginBottom: 4 }}>
                    <span>{dc} / {p.done.length}</span><span>{pct}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 4, background: '#eef1f6', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 4, background: '#2563c9', width: pct }} />
                  </div>
                </div>
                <div style={{ flex: 'none', width: 70, textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: '#8a94a4' }}>best FID</div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, fontWeight: 600 }}>{runFid(p)}</div>
                </div>
                <div style={{ flex: 'none', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: st.bg, color: st.fg, width: 104, textAlign: 'center' }}>{st.label}</div>
                <div style={{ flex: 'none', fontSize: 11, color: '#8a94a4', width: 60, textAlign: 'right' }}>{relDate(r.updatedAt)}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

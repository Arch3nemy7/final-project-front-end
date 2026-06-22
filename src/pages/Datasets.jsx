import { useStore } from '../store/StoreContext.jsx'
import { relDate } from '../lib/format.js'
import { IconDatasets } from '../components/icons.jsx'

export default function Datasets() {
  const { db } = useStore()
  const ids = db.order.filter((id) => db.runs[id].pipe.fmtDone)

  if (ids.length === 0) {
    return (
      <div style={{ background: '#fff', border: '1px dashed #d4dae4', borderRadius: 14, padding: 46, textAlign: 'center', color: '#8a94a4', fontSize: 14 }}>
        No formatted datasets yet. Format a dataset inside a run to register it here.
      </div>
    )
  }

  const stat = (label, value) => (
    <div>
      <div style={{ fontSize: 10.5, color: '#8a94a4' }}>{label}</div>
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 15, fontWeight: 600 }}>{value}</div>
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {ids.map((id) => {
        const r = db.runs[id], p = r.pipe
        const tot = ((p.posFile && p.posFile.count) || 0) + ((p.negFile && p.negFile.count) || 0)
        return (
          <div key={id} style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: '#e9f0fc', color: '#2563c9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconDatasets size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                  <div style={{ fontSize: 11.5, color: '#8a94a4' }}>{relDate(r.updatedAt)}</div>
                </div>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 600, color: '#16916a', background: '#e6f5ee', padding: '3px 8px', borderRadius: 6 }}>FORMATTED</div>
            </div>
            <div style={{ display: 'flex', gap: 22 }}>
              {stat('Crops', tot.toLocaleString())}
              {stat('Resolution', <>{p.cfg.res}²</>)}
              {stat('Classes', '2')}
            </div>
          </div>
        )
      })}
    </div>
  )
}

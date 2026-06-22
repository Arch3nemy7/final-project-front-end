import { useStore } from '../../store/StoreContext.jsx'
import { resultsOf } from '../../lib/results.js'
import { toTick } from '../../lib/format.js'
import Gallery from '../Gallery.jsx'
import { Eyebrow, H1, Lead, JobBar } from './parts.jsx'

export default function GenerateStage({ run, C }) {
  const { live, patchPipe, setLive, cancelGen, startGen } = useStore()
  const p = run.pipe

  const genRunning = live.gen === 'running'
  const genDone = p.generated && !genRunning
  const genShowCfg = !genRunning

  const R = resultsOf(run)
  const ckpts = [
    { name: 'Gram-negative', accent: C.neg, tick: R.gnTick, fid: R.gnBest },
    { name: 'Gram-positive', accent: C.pos, tick: R.gpTick, fid: R.gpBest },
  ]

  // Real generated images from the backend (empty until generation runs).
  const tiles = (R.gallery || []).map((g) => ({ src: g.src, cls: g.cls }))
  const gallery = tiles
    .filter((t) => live.genFilter === 'all' || live.genFilter === t.cls)
    .map((t, i) => ({ src: t.src, key: t.src + i, ring: t.cls === 'pos' ? C.pos : C.neg }))
  const genTotal = R.genTotal != null ? R.genTotal : (parseInt(p.genN, 10) || 0) * 2

  const filters = [
    { k: 'all', label: 'All' }, { k: 'pos', label: 'Gram-positive' }, { k: 'neg', label: 'Gram-negative' },
  ]

  return (
    <div>
      <Eyebrow>STEP 04 · SYNTHESIS</Eyebrow>
      <H1>Generate synthetic images</H1>
      <Lead maxWidth={680}>
        Each generator runs in inference mode from its <strong>best checkpoint</strong> (selected by the fidelity test) to synthesize new single-cell crops per class.
      </Lead>

      {genShowCfg && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {ckpts.map((ck) => (
              <div key={ck.name} style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, padding: '16px 20px', borderLeft: '3px solid ' + ck.accent, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: ck.accent }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{ck.name}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#8a94a4' }}>checkpoint @ tick {ck.tick != null ? toTick(ck.tick) : '—'}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#8a94a4' }}>FID</div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 600, color: ck.accent }}>{ck.fid != null ? ck.fid : '—'}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 16, maxWidth: 420 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#5b6677' }}>Images per class</span>
            <input type="number" value={p.genN} onChange={(e) => patchPipe(run.id, { genN: e.target.value })} style={{ width: 120, padding: '9px 11px', border: '1px solid #e6e9f0', borderRadius: 8, fontSize: 14, fontWeight: 600 }} />
          </div>
        </>
      )}

      {genRunning && (
        <JobBar title={`Synthesizing ${live.genPhase} images…`} pct={live.genPct} onCancel={cancelGen} />
      )}

      {genDone && (
        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {filters.map((f) => {
                const sel = live.genFilter === f.k
                return (
                  <button key={f.k} onClick={() => setLive({ genFilter: f.k })} style={{ fontSize: 12.5, fontWeight: 600, padding: '7px 14px', borderRadius: 8, cursor: 'pointer', background: sel ? C.ink : '#fff', color: sel ? '#fff' : C.muted, border: '1px solid ' + (sel ? C.ink : C.line) }}>
                    {f.label}
                  </button>
                )
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button onClick={() => startGen(run.id)} style={{ fontSize: 12, fontWeight: 600, color: '#2563c9', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>↻ Regenerate</button>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: '#8a94a4' }}>Showing {gallery.length} of {genTotal.toLocaleString()} generated images</div>
            </div>
          </div>
          <Gallery items={gallery} />
        </div>
      )}
    </div>
  )
}

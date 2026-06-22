import { useStore } from '../../store/StoreContext.jsx'
import { IconUpload, IconFileArchive, IconCheck, IconSpinner } from '../icons.jsx'
import { Eyebrow, H1, Lead } from './parts.jsx'

// Upload card for one Gram class (violet for positive, rose for negative).
function UploadCard({ tone, label, labelColor, topColor, file, onPick }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, padding: 20, borderTop: '3px solid ' + topColor }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 13 }}>
        <span style={{ width: 11, height: 11, borderRadius: 3, background: topColor }} />
        <span style={{ fontWeight: 600, fontSize: 14.5, color: labelColor }}>{label}</span>
      </div>
      {file ? (
        <div style={{ background: tone.soft, borderRadius: 10, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <span style={{ color: topColor }}><IconFileArchive size={22} /></span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12.5, fontWeight: 600, color: labelColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
              <div style={{ fontSize: 11.5, color: tone.subColor, marginTop: 2 }}>{file.mb} MB · {file.count} crops detected</div>
            </div>
          </div>
          <label style={{ display: 'inline-block', marginTop: 11, fontSize: 11.5, color: topColor, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
            Replace<input type="file" accept=".zip" onChange={onPick} />
          </label>
        </div>
      ) : (
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 9, border: '2px dashed ' + tone.dash, borderRadius: 11, padding: '26px 16px', cursor: 'pointer', textAlign: 'center' }}>
          <span style={{ color: topColor }}><IconUpload size={28} /></span>
          <div style={{ fontSize: 13, fontWeight: 600, color: labelColor }}>Drop {tone.fileName}</div>
          <div style={{ fontSize: 11.5, color: '#8a94a4' }}>or click to browse · .zip</div>
          <input type="file" accept=".zip" onChange={onPick} />
        </label>
      )}
    </div>
  )
}

const chip = (label, value) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#fff', border: '1px solid #e6e9f0', borderRadius: 8, padding: '8px 13px', fontSize: 12, color: '#5b6677' }}>
    <span style={{ color: '#8a94a4' }}>{label}</span>
    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, color: '#16202e' }}>{value}</span>
  </div>
)

export default function FormatStage({ run, C }) {
  const { live, patchPipe, setCfg, cancelFormat } = useStore()
  const p = run.pipe
  const fmtRunning = live.fmt === 'running'
  const fmtDone = p.fmtDone && !fmtRunning

  const onPick = (cls, e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const info = { name: f.name, mb: (f.size / 1048576).toFixed(1), count: cls === 'pos' ? 6054 : 13141 }
    patchPipe(run.id, cls === 'pos' ? { posFile: info } : { negFile: info })
  }

  const stepDefs = [
    { label: 'Validate archives & scan images', d: 0.25, lo: 0 },
    { label: 'Resize crops → ' + p.cfg.res + '×' + p.cfg.res + ' (bicubic)', d: 0.5, lo: 0.25 },
    { label: 'Build dataset.json + Gram labels', d: 0.75, lo: 0.5 },
    { label: 'Package training-ready dataset', d: 1.0, lo: 0.75 },
  ]
  const fmtTotal = ((p.posFile && p.posFile.count) || 0) + ((p.negFile && p.negFile.count) || 0)

  return (
    <div>
      <Eyebrow>STEP 01 · DATA FORMATTING</Eyebrow>
      <H1>Upload &amp; standardize both class datasets</H1>
      <Lead maxWidth={680}>
        Drop in the two cropped archives. GramSynth validates them, resizes every crop to your chosen resolution, writes Gram labels, and packages a training-ready dataset — then continues straight into training.
      </Lead>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <UploadCard
          tone={{ soft: C.posSoft, subColor: '#7a6aa8', dash: '#d8cef0', fileName: 'gram_positive.zip' }}
          label="Gram-positive crops" labelColor={C.posInk} topColor={C.pos}
          file={p.posFile} onPick={(e) => onPick('pos', e)}
        />
        <UploadCard
          tone={{ soft: C.negSoft, subColor: '#b06088', dash: '#f0cfdf', fileName: 'gram_negative.zip' }}
          label="Gram-negative crops" labelColor={C.negInk} topColor={C.neg}
          file={p.negFile} onPick={(e) => onPick('neg', e)}
        />
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e6e9f0', borderRadius: 8, padding: '6px 10px 6px 13px', fontSize: 12, color: '#5b6677' }}>
          <span style={{ color: '#8a94a4' }}>Resolution</span>
          <select value={p.cfg.res} onChange={(e) => setCfg(run.id, 'res', e.target.value)} style={{ border: 'none', background: 'transparent', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, color: '#16202e', fontSize: 12, cursor: 'pointer' }}>
            <option value="128">128 × 128</option>
            <option value="256">256 × 256</option>
            <option value="512">512 × 512</option>
          </select>
        </div>
        {chip('Interpolation', 'bicubic')}
        {chip('Labels', 'dataset.json')}
      </div>

      {fmtRunning && (
        <div style={{ marginTop: 18, background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Formatting datasets…</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button onClick={cancelFormat} style={{ fontSize: 12, fontWeight: 600, color: '#cc4040', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Cancel</button>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, fontWeight: 600, color: '#2563c9' }}>{Math.round(live.fmtPct * 100)}%</div>
            </div>
          </div>
          <div style={{ height: 8, borderRadius: 5, background: '#eef1f6', overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ height: '100%', background: '#2563c9', borderRadius: 5, width: (live.fmtPct * 100) + '%', transition: 'width .2s' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stepDefs.map((x, i) => {
              const reached = live.fmtPct >= x.d - 0.001
              const activeS = !reached && live.fmtPct >= x.lo
              const icoBg = reached ? C.ok : (activeS ? C.primary : '#eef1f6')
              const icoFg = reached ? '#fff' : (activeS ? '#fff' : C.faint)
              const textCol = reached ? C.ink : (activeS ? C.ink : C.faint)
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <div style={{ flex: 'none', width: 22, height: 22, borderRadius: 7, background: icoBg, color: icoFg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {reached ? <IconCheck size={12} /> : (activeS ? <span className="gs-spin" style={{ display: 'flex' }}><IconSpinner size={12} /></span> : null)}
                  </div>
                  <div style={{ fontSize: 13, color: textCol }}>{x.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {fmtDone && (
        <div style={{ marginTop: 18, background: '#e6f5ee', border: '1px solid #b7e2cd', borderRadius: 14, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 15 }}>
          <div style={{ flex: 'none', width: 40, height: 40, borderRadius: 11, background: '#16916a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <IconCheck size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: '#0f5f45' }}>Dataset formatted · {fmtTotal.toLocaleString()} crops at {p.cfg.res}×{p.cfg.res}</div>
            <div style={{ fontSize: 13, color: '#2f7a5e', marginTop: 2 }}>
              {(p.posFile && p.posFile.count) || 0} Gram-positive · {(p.negFile && p.negFile.count) || 0} Gram-negative · labels written. Ready for training.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useStore } from '../../store/StoreContext.jsx'
import { resultsOf } from '../../lib/results.js'
import { assetUrl } from '../../api/client.js'
import { fmtTime, toTick, toTickCurve } from '../../lib/format.js'
import LineChart from '../charts/LineChart.jsx'
import CheckpointStrip from './CheckpointStrip.jsx'
import { IconChevronDown } from '../icons.jsx'
import { Eyebrow, H1, Lead, MiniToggle, RerunButton } from './parts.jsx'

const lblStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#5b6677', marginBottom: 6 }
const ctrlStyle = { width: '100%', padding: '9px 11px', border: '1px solid #e6e9f0', borderRadius: 8, fontSize: 13 }

function Select({ label, value, onChange, options }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={lblStyle}>{label}</span>
      <select value={value} onChange={onChange} style={{ ...ctrlStyle, background: '#fff' }}>
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  )
}
function Input({ label, value, onChange, type = 'text', step, placeholder }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={lblStyle}>{label}</span>
      <input type={type} step={step} placeholder={placeholder} value={value} onChange={onChange} style={ctrlStyle} />
    </label>
  )
}
function ToggleBox({ label, on, onClick, C }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', border: '1px solid #e6e9f0', borderRadius: 8, cursor: 'pointer', alignSelf: 'flex-end' }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#5b6677' }}>{label}</span>
      <MiniToggle on={on} C={C} />
    </div>
  )
}

const RES_OPTS = [{ v: '128', l: '128 × 128' }, { v: '256', l: '256 × 256' }, { v: '512', l: '512 × 512' }]

function GenCard({ card }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, padding: '18px 20px', borderLeft: '3px solid ' + card.accent }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 13 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{card.name}</div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#8a94a4' }}>{card.sub}</div>
        </div>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 600, padding: '4px 9px', borderRadius: 6, background: card.statusBg, color: card.statusFg }}>{card.status}</div>
      </div>
      <div style={{ display: 'flex', gap: 18, marginBottom: 12 }}>
        <div><div style={{ fontSize: 11, color: '#8a94a4' }}>Tick</div><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 22, fontWeight: 600, color: card.accent }}>{card.tickText}</div></div>
        <div><div style={{ fontSize: 11, color: '#8a94a4' }}>Augment</div><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 22, fontWeight: 600 }}>{card.augText}</div></div>
        <div><div style={{ fontSize: 11, color: '#8a94a4' }}>ETA</div><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 22, fontWeight: 600 }}>{card.etaText}</div></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#5b6677', marginBottom: 5 }}>
        <span>tick {card.progText}</span><span>{card.pctText}</span>
      </div>
      <div style={{ height: 7, borderRadius: 5, background: '#eef1f6', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 5, background: card.accent, width: card.barW, transition: 'width .2s' }} />
      </div>
    </div>
  )
}

function SampleColumn({ dot, label, labelColor, sample }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
        <span style={{ width: 9, height: 9, borderRadius: 2, background: dot }} />
        <span style={{ fontSize: 12.5, fontWeight: 600, color: labelColor }}>{label}</span>
        {sample && <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: '#8a94a4', marginLeft: 'auto' }}>@ tick {toTick(sample.kimg)}</span>}
      </div>
      {sample ? (
        // Real snapshot grid (streamed live, or imported from a trained run).
        <img src={assetUrl(sample.url)} alt="" style={{ width: '100%', borderRadius: 8, display: 'block' }} />
      ) : (
        <div style={{ borderRadius: 8, border: '1px dashed #e6e9f0', padding: '28px 12px', textAlign: 'center', color: '#8a94a4', fontSize: 12 }}>
          Awaiting first snapshot…
        </div>
      )}
    </div>
  )
}

export default function TrainStage({ run, C }) {
  const { live, setCfg, setLive, startTrain, cancelTrain } = useStore()
  const p = run.pipe
  const cfg = p.cfg
  const total = parseInt(cfg.ticks, 10) || 1000
  const R = resultsOf(run)

  const trainRunning = live.train === 'running'
  const trainDone = p.gnDone && p.gpDone && !trainRunning
  const trainIdle = !trainRunning && !trainDone
  const trainBusy = trainRunning || trainDone
  const stats = live.stats || {}

  const mk = (k) => (e) => setCfg(run.id, k, e.target.value)

  // ----- live monitoring view-model (real training stats; FID is now the next step) -----
  const mkCard = (cls) => {
    const isGN = cls === 'gn'
    const cdone = isGN ? p.gnDone : p.gpDone
    // each generator can be trained for a different number of ticks
    const clsTotal = (isGN ? R.gnDur : R.gpDur) || total
    const isActive = trainRunning && live.trainClass === cls && !cdone
    const queued = trainRunning && !isActive && !cdone
    const tk = cdone ? clsTotal : (isActive ? (live.kimg || 0) : 0)
    const pct = clsTotal ? tk / clsTotal : 0
    const status = cdone ? 'Completed' : isActive ? 'Training' : queued ? 'Queued' : 'Idle'
    return {
      name: isGN ? 'Gram-Negative' : 'Gram-Positive', sub: isGN ? 'Generator G_neg' : 'Generator G_pos',
      status, statusBg: cdone ? C.okSoft : isActive ? C.primarySoft : '#f1f3f8', statusFg: cdone ? C.ok : isActive ? C.primary : C.faint,
      accent: isGN ? C.neg : C.pos, progText: toTick(tk) + ' / ' + toTick(clsTotal), pctText: Math.round(pct * 100) + '%', barW: (pct * 100) + '%',
      tickText: isActive && stats.tick != null ? String(stats.tick) : (cdone ? 'done' : '—'),
      augText: isActive && stats.augment != null ? stats.augment.toFixed(3) : '—',
      etaText: isActive ? fmtTime((clsTotal - (live.kimg || 0)) * 0.92) : (cdone ? 'Done' : '—'),
    }
  }

  return (
    <div>
      <Eyebrow>STEP 02 · GAN TRAINING</Eyebrow>
      <H1>Train StyleGAN2-ADA generators</H1>
      <Lead maxWidth={700}>
        Two generators train <strong>sequentially</strong> — Gram-negative first, then Gram-positive — each transfer-learned from FFHQ-256. The best checkpoint per class is kept.
      </Lead>

      {trainIdle && (
        <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, padding: '22px 24px' }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>Essential parameters</div>
          <div style={{ fontSize: 12, color: '#8a94a4', marginBottom: 16 }}>Shared by both generators · NVlabs StyleGAN2-ADA (PyTorch), unmodified.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '15px 16px' }}>
            <Select label="Base config (--cfg)" value={cfg.cfg} onChange={mk('cfg')} options={[
              { v: 'auto', l: 'auto' }, { v: 'stylegan2', l: 'stylegan2' }, { v: 'paper256', l: 'paper256' },
              { v: 'paper512', l: 'paper512' }, { v: 'paper1024', l: 'paper1024' }, { v: 'cifar', l: 'cifar' }]} />
            <Input label="Training duration (--kimg)" type="number" value={cfg.ticks} onChange={mk('ticks')} />
            <Input label="Snapshot / FID every (--snap)" type="number" value={cfg.snap} onChange={mk('snap')} />
            <Input label="Batch size (--batch)" type="number" value={cfg.batch} onChange={mk('batch')} />
            <Input label="GPUs (--gpus)" type="number" value={cfg.gpus} onChange={mk('gpus')} />
            <Select label="Augmentation (--aug)" value={cfg.aug} onChange={mk('aug')} options={[
              { v: 'ada', l: 'ada' }, { v: 'noaug', l: 'noaug' }, { v: 'fixed', l: 'fixed' }]} />
            <Input label="ADA target (--target)" type="number" step="0.05" value={cfg.target} onChange={mk('target')} />
            <Select label="Transfer learning (--resume)" value={cfg.resume} onChange={mk('resume')} options={[
              { v: 'ffhq256', l: 'ffhq256' }, { v: 'ffhq512', l: 'ffhq512' }, { v: 'ffhq1024', l: 'ffhq1024' },
              { v: 'celebahq256', l: 'celebahq256' }, { v: 'lsundog256', l: 'lsundog256' }, { v: 'noresume', l: 'noresume' }]} />
            <Select label="Resolution" value={cfg.res} onChange={mk('res')} options={RES_OPTS} />
          </div>

          <div onClick={() => setLive({ advOpen: !live.advOpen })} style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#2563c9' }}>
            <IconChevronDown size={14} /> Advanced parameters
          </div>

          {live.advOpen && (
            <div style={{ marginTop: 14, paddingTop: 16, borderTop: '1px solid #eef1f6', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '15px 16px' }}>
              <Select label="Aug pipeline (--augpipe)" value={cfg.augpipe} onChange={mk('augpipe')} options={[
                { v: 'bgc', l: 'bgc' }, { v: 'blit', l: 'blit' }, { v: 'geom', l: 'geom' }, { v: 'color', l: 'color' },
                { v: 'bg', l: 'bg' }, { v: 'bgcf', l: 'bgcf' }, { v: 'bgcfn', l: 'bgcfn' }, { v: 'bgcfnc', l: 'bgcfnc' }]} />
              <Input label="R1 gamma (--gamma)" placeholder="auto" value={cfg.gamma} onChange={mk('gamma')} />
              <Input label="Metrics (--metrics)" value={cfg.metrics} onChange={mk('metrics')} />
              <Input label="Random seed (--seed)" type="number" value={cfg.seed} onChange={mk('seed')} />
              <Input label="Subset (--subset)" placeholder="all" value={cfg.subset} onChange={mk('subset')} />
              <Input label="Freeze-D layers (--freezed)" type="number" value={cfg.freezed} onChange={mk('freezed')} />
              <Input label="DataLoader workers (--workers)" type="number" value={cfg.workers} onChange={mk('workers')} />
              <ToggleBox label="x-flip mirror" on={cfg.mirror} onClick={() => setCfg(run.id, 'mirror', !cfg.mirror)} C={C} />
              <ToggleBox label="Disable mixed-precision" on={cfg.fp32} onClick={() => setCfg(run.id, 'fp32', !cfg.fp32)} C={C} />
              <ToggleBox label="Allow TF32" on={cfg.tf32} onClick={() => setCfg(run.id, 'tf32', !cfg.tf32)} C={C} />
            </div>
          )}
        </div>
      )}

      {trainBusy && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <GenCard card={mkCard('gn')} />
            <GenCard card={mkCard('gp')} />
          </div>

          {(live.augGN.length > 0 || live.augGP.length > 0) && (
            <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>ADA augmentation probability (p)</div>
                <div style={{ display: 'flex', gap: 13, fontSize: 11, fontFamily: "'IBM Plex Mono',monospace" }}>
                  <span style={{ color: '#d23f7d' }}>● Gram−</span><span style={{ color: '#6d4bd1' }}>● Gram+</span>
                </div>
              </div>
              <LineChart w={620} h={210} xMax={toTick(total)} yMax={1} yMin={0} yLabel="p  (x: tick)"
                series={[{ points: toTickCurve(live.augGN), color: C.neg }, { points: toTickCurve(live.augGP), color: C.pos }]}
                benchmarks={[{ y: parseFloat(cfg.target) || 0.6, color: '#9aa3b2', label: 'target ' + (parseFloat(cfg.target) || 0.6) }]}
                yFmt={(v) => v.toFixed(1)} />
            </div>
          )}

          {trainRunning && live.stats && (
            <div style={{ background: '#16202e', borderRadius: 14, padding: '16px 20px', marginBottom: 16, fontFamily: "'IBM Plex Mono',monospace", color: '#cbd3e1', fontSize: 13, lineHeight: 1.9 }}>
              <div style={{ color: '#8a94a4', marginBottom: 6, fontSize: 11, letterSpacing: '.08em' }}>LIVE TRAINING STATS · {live.trainClass === 'gn' ? 'GRAM-NEGATIVE' : 'GRAM-POSITIVE'}</div>
              <span>tick </span><b style={{ color: '#fff' }}>{stats.tick != null ? stats.tick : '—'}</b>{'    '}
              <span>time </span><b style={{ color: '#fff' }}>{stats.totalSec != null ? fmtTime(stats.totalSec) : '—'}</b>{'    '}
              <span>sec/tick </span><b style={{ color: '#fff' }}>{stats.secPerTick != null ? stats.secPerTick.toFixed(1) : '—'}</b>{'    '}
              <span>sec/kimg </span><b style={{ color: '#fff' }}>{stats.secPerKimg != null ? stats.secPerKimg.toFixed(2) : '—'}</b>{'    '}
              <span>gpumem </span><b style={{ color: '#fff' }}>{stats.gpumem != null ? stats.gpumem.toFixed(2) : '—'}</b>{'    '}
              <span>cpumem </span><b style={{ color: '#fff' }}>{stats.cpumem != null ? stats.cpumem.toFixed(2) : '—'}</b>{'    '}
              <span style={{ color: '#e6a86b' }}>augment </span><b style={{ color: '#e6a86b' }}>{stats.augment != null ? stats.augment.toFixed(3) : '—'}</b>
            </div>
          )}

          {(() => {
            const gnSamples = live.trainSamplesGN.length ? live.trainSamplesGN : R.trainSamplesGN
            const gpSamples = live.trainSamplesGP.length ? live.trainSamplesGP : R.trainSamplesGP
            const haveStrips = gnSamples.length || gpSamples.length
            return (
              <div style={{ background: '#fff', border: '1px solid #e6e9f0', borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Checkpoint samples</div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#8a94a4' }}>snapshot every {cfg.snap} ticks · click to enlarge · FID is measured in the next step</div>
                </div>
                {haveStrips ? (
                  <>
                    <CheckpointStrip title="Gram-negative" accent="#a82a60" samples={gnSamples} />
                    <CheckpointStrip title="Gram-positive" accent="#4a31a3" samples={gpSamples} />
                  </>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <SampleColumn dot="#d23f7d" label="Gram-negative" labelColor="#a82a60"
                      sample={live.sampleGN || (R.trainSampleGN ? { url: R.trainSampleGN, kimg: R.gnTick } : null)} />
                    <SampleColumn dot="#6d4bd1" label="Gram-positive" labelColor="#4a31a3"
                      sample={live.sampleGP || (R.trainSampleGP ? { url: R.trainSampleGP, kimg: R.gpTick } : null)} />
                  </div>
                )}
              </div>
            )
          })()}

          {trainRunning && (
            <div style={{ marginTop: 14, textAlign: 'center' }}>
              <button onClick={cancelTrain} style={{ fontSize: 13, fontWeight: 600, color: '#cc4040', background: '#fff', border: '1px solid #f0d2d2', borderRadius: 9, padding: '9px 18px', cursor: 'pointer' }}>Cancel training</button>
            </div>
          )}
          {trainDone && (
            <div style={{ marginTop: 14, textAlign: 'center' }}>
              <RerunButton label="↻ Retrain generators" onClick={() => startTrain(run.id)} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

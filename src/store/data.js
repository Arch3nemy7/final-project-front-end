// Static config + database helpers for the GramSynth front end. Real data
// (FID, F1, generated images, run telemetry) comes from the backend at runtime;
// this file holds only fixed labels, defaults, and the local persistence layer.

export const KEY = 'gramsynth.db.v3'

// The five classifier architectures of the feasibility study (fixed labels).
export const F1_ARCHS = ['ResNet-50', 'DenseNet-121', 'VGG-16', 'MobileNetV3', 'InceptionV3']

export const STAGES = [
  { num: '01', title: 'Format' },
  { num: '02', title: 'Train' },
  { num: '03', title: 'Fidelity' },
  { num: '04', title: 'Generate' },
  { num: '05', title: 'Feasibility' },
  { num: '06', title: 'Results' },
]

export const ACCENT_OPTIONS = ['#2563c9', '#0e7490', '#6d4bd1', '#1f8a5b', '#b4530a']

// Colour palette derived from the active accent (rest is fixed in the design).
export function palette(accent) {
  const p = accent || '#2563c9'
  return {
    primary: p, primarySoft: '#e9f0fc', ink: '#16202e', muted: '#5b6677', faint: '#8a94a4',
    line: '#e6e9f0', line2: '#eef1f6', pos: '#6d4bd1', posSoft: '#efeafb', posInk: '#4a31a3',
    neg: '#d23f7d', negSoft: '#fce9f1', negInk: '#a82a60', ok: '#16916a', okSoft: '#e6f5ee',
    amber: '#b9831a', amberSoft: '#faf1de', danger: '#cc4040', dangerSoft: '#fbeaea',
  }
}

export function defaultCfg() {
  return {
    cfg: 'auto', res: '256', ticks: '1000', snap: '50', batch: '32', gpus: '1', aug: 'ada',
    target: '0.6', resume: 'ffhq256', augpipe: 'bgc', gamma: '', metrics: 'fid50k_full',
    seed: '0', mirror: false, subset: '', freezed: '0', fp32: false, tf32: false, workers: '3',
  }
}

export function defaultPipe() {
  return {
    stage: 0, done: [false, false, false, false, false, false],
    posFile: null, negFile: null, fmtDone: false, cfg: defaultCfg(),
    gnDone: false, gpDone: false, generated: false, genN: '5000',
    fidDone: false, feasDone: false,
    // real-crop datasets used by the Fidelity FID sweep (per class)
    fidData: { gn: '', gp: '', num: '10000' },
  }
}

export function freshLive() {
  return {
    fmt: 'idle', fmtPct: 0, advOpen: false, train: 'idle', trainClass: 'gn',
    kimg: 0, stats: null,                      // live training stats (tick/kimg/augment/…)
    augGN: [], augGP: [],                      // ADA augment-vs-kimg curve (Train step)
    fidGN: [], fidGP: [],                      // FID-vs-kimg sweep curve (Fidelity step)
    fidSamplesGN: [], fidSamplesGP: [],        // per-checkpoint sample grids (Fidelity step)
    trainSamplesGN: [], trainSamplesGP: [],    // per-checkpoint sample grids (Train step)
    // latest real checkpoint-sample grid per class, streamed during training
    sampleGN: null, sampleGP: null,
    gen: 'idle', genPct: 0, genPhase: '',
    fid: 'idle', fidPct: 0, fidStep: '', fidError: '',   // Fidelity = per-checkpoint FID sweep
    feas: 'idle', feasPct: 0, feasStep: '', genFilter: 'all',
  }
}

export function newId() {
  return 'r-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
}

// Empty workspace — no demo/seed runs. Real runs come from creating one (which
// drives the backend) or from adopting server-side runs (e.g. imported models).
export function emptyDb() {
  return {
    runs: {},
    order: [],
    settings: { simSpeed: 'normal', autoAdvance: false, accent: '#2563c9' },
  }
}

// Kept as the reset target.
export const seedDb = emptyDb

// Load the persisted DB, falling back to an empty workspace.
export function loadDb() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const db = JSON.parse(raw)
      if (db && db.runs && db.order) {
        if (!db.settings) db.settings = { simSpeed: 'normal', autoAdvance: false, accent: '#2563c9' }
        db.order.forEach((id) => {
          const r = db.runs[id]
          if (r && r.pipe) {
            const p = r.pipe
            if (p.done && p.done.length > 6) p.done = p.done.slice(1)
            if (typeof p.stage === 'number' && p.stage > 5) p.stage = 5
            if (p.cfg && !p.cfg.res) p.cfg.res = '256'
          }
        })
        return db
      }
    }
  } catch (e) { /* ignore corrupt storage */ }
  return seedDb()
}

export function saveDb(db) {
  try { localStorage.setItem(KEY, JSON.stringify(db)) } catch (e) { /* quota / private mode */ }
}

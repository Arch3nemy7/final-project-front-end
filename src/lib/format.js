// Time + status helpers for the GramSynth front end.

// StyleGAN2-ADA logs progress in kimg; 1 tick = 4 kimg (kimg_per_tick default).
// The checkpoint filenames are kimg, so we convert to ticks for display.
export const KIMG_PER_TICK = 4
export const toTick = (kimg) => (kimg == null ? null : Math.round(kimg / KIMG_PER_TICK))
export const toTickCurve = (pts) => (pts || []).map((p) => ({ x: toTick(p.x), y: p.y }))

// Adaptive FID y-axis: fit the data (and the benchmarks) with headroom, rounded.
export function fidYMax(...curves) {
  const ys = curves.flat().map((p) => p && p.y).filter((v) => v != null)
  const m = Math.max(21.17, ...(ys.length ? ys : [40]))
  return Math.ceil((m * 1.12) / 10) * 10
}

export function fmtTime(sec) {
  sec = Math.max(0, Math.round(sec))
  const m = Math.floor(sec / 60), s = sec % 60
  return m + 'm ' + (s < 10 ? '0' : '') + s + 's'
}

export function relDate(ts) {
  const d = Math.floor((Date.now() - ts) / 86400000)
  if (d <= 0) return 'today'
  if (d === 1) return '1d ago'
  if (d < 30) return d + 'd ago'
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// Status descriptor for a pipeline, mirroring statusOf() in the design.
export function statusOf(p, C) {
  if (p.feasDone) return { label: 'Complete', bg: C.okSoft, fg: C.ok, dot: C.ok }
  if (p.fidDone) return { label: 'Testing', bg: C.primarySoft, fg: C.primary, dot: C.primary }
  if (p.generated) return { label: 'Generated', bg: C.primarySoft, fg: C.primary, dot: C.primary }
  if (p.gnDone && p.gpDone) return { label: 'Trained', bg: C.primarySoft, fg: C.primary, dot: C.primary }
  if (p.fmtDone) return { label: 'Ready to train', bg: C.amberSoft, fg: C.amber, dot: C.amber }
  if (p.posFile) return { label: 'In setup', bg: C.line2, fg: C.muted, dot: C.faint }
  return { label: 'Draft', bg: C.line2, fg: C.faint, dot: C.faint }
}

export const runFid = (p) => {
  const b = p.results && p.results.train && p.results.train.gn && p.results.train.gn.bestFid
  return b != null ? String(b) : '—'
}

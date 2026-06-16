import { useState, useRef, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, Legend,
} from 'recharts'
import { Zap, Target, Clock, TrendingDown } from 'lucide-react'
import { fidProgression, BEST_FID_GN, BEST_FID_GP, BENCHMARK_GN, BENCHMARK_GP, ganHyperparams } from '../data/metrics'

// ─── Deterministic bacteria cell painter ─────────────────────────────────────
function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return ((s >>> 0) / 0xffffffff)
  }
}

function BacteriaCanvas({ type, tick, width = 256, height = 256 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rng = seededRandom(type === 'pos' ? tick * 7 + 3 : tick * 13 + 11)

    // Quality 0→1 mapping based on tick (mirrors FID convergence curve)
    const rawQ = tick === 0 ? 0 : tick < 50 ? 0.25 : tick < 200 ? 0.55 : tick < 500 ? 0.75 : 0.92 + rng() * 0.06
    const quality = Math.min(1, rawQ)
    const noise = 1 - quality

    // Background — dark field
    ctx.fillStyle = '#08090f'
    ctx.fillRect(0, 0, width, height)

    // Subtle background noise at low quality
    if (noise > 0.1) {
      for (let i = 0; i < 1200 * noise; i++) {
        const x = rng() * width
        const y = rng() * height
        const a = rng() * 0.15 * noise
        ctx.fillStyle = `rgba(255,255,255,${a})`
        ctx.fillRect(x, y, 1, 1)
      }
    }

    const count = type === 'pos' ? 18 : 14

    for (let i = 0; i < count; i++) {
      const cx = rng() * (width - 40) + 20
      const cy = rng() * (height - 40) + 20
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate((rng() - 0.5) * Math.PI * 2)

      if (type === 'pos') {
        // Cocci — round/oval, purple
        const rx = 8 + rng() * 6
        const ry = rx * (0.7 + rng() * 0.4)
        const alpha = quality * (0.7 + rng() * 0.3)

        const grad = ctx.createRadialGradient(-rx * 0.2, -ry * 0.2, 1, 0, 0, rx * 1.3)
        grad.addColorStop(0, `rgba(196,181,253,${alpha})`)
        grad.addColorStop(0.5, `rgba(139,92,246,${alpha * 0.9})`)
        grad.addColorStop(1, `rgba(88,28,135,${alpha * 0.5})`)

        ctx.beginPath()
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        // Highlight
        ctx.beginPath()
        ctx.ellipse(-rx * 0.25, -ry * 0.25, rx * 0.3, ry * 0.25, 0, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(237,233,254,${alpha * 0.35})`
        ctx.fill()

      } else {
        // Bacilli — rod-shaped, pink/rose
        const len = 18 + rng() * 22
        const thick = 5 + rng() * 4
        const alpha = quality * (0.7 + rng() * 0.3)

        const grad = ctx.createLinearGradient(-len / 2, -thick, len / 2, thick)
        grad.addColorStop(0, `rgba(244,114,182,${alpha * 0.6})`)
        grad.addColorStop(0.5, `rgba(249,168,212,${alpha})`)
        grad.addColorStop(1, `rgba(190,24,93,${alpha * 0.6})`)

        // Draw pill shape (roundRect polyfill via arc)
        const r = thick / 2
        const x0 = -len / 2, y0 = -r
        ctx.beginPath()
        ctx.moveTo(x0 + r, y0)
        ctx.lineTo(x0 + len - r, y0)
        ctx.arc(x0 + len - r, 0, r, -Math.PI / 2, Math.PI / 2)
        ctx.lineTo(x0 + r, r)
        ctx.arc(x0 + r, 0, r, Math.PI / 2, -Math.PI / 2)
        ctx.closePath()
        ctx.fillStyle = grad
        ctx.fill()

        // Highlight streak
        ctx.beginPath()
        ctx.rect(-len / 2 + 3, -thick / 2 + 1, len - 6, thick * 0.35)
        ctx.fillStyle = `rgba(253,242,248,${alpha * 0.3})`
        ctx.fill()
      }

      ctx.restore()
    }

    // At high quality: add cell wall detail dots (Gram stain artifacts)
    if (quality > 0.7) {
      for (let i = 0; i < 40 * quality; i++) {
        const x = rng() * width
        const y = rng() * height
        const color = type === 'pos' ? `rgba(167,139,250,0.15)` : `rgba(244,114,182,0.15)`
        ctx.beginPath()
        ctx.arc(x, y, 0.8, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      }
    }
  }, [type, tick, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-xl w-full h-full object-cover"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function FidTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/10 bg-gray-900 px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">Tick {label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-mono font-semibold">
          {p.name}: {Number(p.value).toFixed(2)}
        </p>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Generator() {
  const [selectedTick, setSelectedTick] = useState(900)
  const [activeType, setActiveType] = useState('both')

  const currentPoint = fidProgression.find(d => d.tick === selectedTick) || fidProgression.at(-1)

  const ticks = fidProgression.map(d => d.tick)
  const tickIdx = ticks.indexOf(selectedTick)

  const handleChartClick = (data) => {
    if (data?.activePayload?.[0]) {
      const tick = data.activeLabel
      if (ticks.includes(Number(tick))) setSelectedTick(Number(tick))
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-24 pb-24 px-4">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-2">Scenario A — GAN Quality</p>
          <h1 className="text-3xl font-bold">Image Generator & FID Convergence</h1>
          <p className="mt-2 text-gray-400 max-w-2xl">
            Two independent StyleGAN2-ADA generators trained for 1,000 ticks on 256×256 px clinical crops.
            Click any point on the chart to preview the visual quality at that training stage.
          </p>
        </div>

        {/* FID Chart + Controls */}
        <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-semibold">FID Score Progression</h2>
              <p className="text-xs text-gray-500 mt-0.5">Lower is better — click a point to preview that checkpoint</p>
            </div>
            <div className="flex gap-2">
              {['both', 'gn', 'gp'].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeType === t
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {t === 'both' ? 'Both' : t === 'gn' ? 'Gram-Negative' : 'Gram-Positive'}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={fidProgression}
              onClick={handleChartClick}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              style={{ cursor: 'pointer' }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="tick" stroke="#6b7280" tick={{ fontSize: 11 }} label={{ value: 'Training Tick', position: 'insideBottom', offset: -3, fill: '#6b7280', fontSize: 11 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} label={{ value: 'FID Score', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 11 }} domain={[0, 50]} />
              <Tooltip content={<FidTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />

              {/* Benchmark lines */}
              <ReferenceLine y={BENCHMARK_GN} stroke="#f472b650" strokeDasharray="6 3"
                label={{ value: `GN benchmark ${BENCHMARK_GN}`, fill: '#f472b6', fontSize: 9, position: 'right' }} />
              <ReferenceLine y={BENCHMARK_GP} stroke="#a78bfa50" strokeDasharray="6 3"
                label={{ value: `GP benchmark ${BENCHMARK_GP}`, fill: '#a78bfa', fontSize: 9, position: 'right' }} />

              {/* Selected tick line */}
              <ReferenceLine x={selectedTick} stroke="#6366f180" strokeDasharray="4 4" />

              {(activeType === 'both' || activeType === 'gn') && (
                <Line
                  type="monotone" dataKey="gn" name="GN FID"
                  stroke="#f472b6" strokeWidth={2} dot={false}
                  activeDot={{ r: 5, fill: '#f472b6' }}
                />
              )}
              {(activeType === 'both' || activeType === 'gp') && (
                <Line
                  type="monotone" dataKey="gp" name="GP FID"
                  stroke="#a78bfa" strokeWidth={2} dot={false}
                  activeDot={{ r: 5, fill: '#a78bfa' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>

          {/* Tick slider */}
          <div className="mt-4">
            <label className="text-xs text-gray-400 mb-2 block">
              Selected Tick: <span className="text-white font-mono font-semibold">{selectedTick}</span>
            </label>
            <input
              type="range"
              min={0} max={ticks.length - 1} step={1}
              value={tickIdx < 0 ? 0 : tickIdx}
              onChange={e => setSelectedTick(ticks[Number(e.target.value)])}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Tick 0</span><span>Tick 500</span><span>Tick 1000</span>
            </div>
          </div>
        </div>

        {/* Image previews */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {[
            { type: 'pos', label: 'Gram-Positive', color: 'violet', fid: currentPoint?.gp, best: BEST_FID_GP },
            { type: 'neg', label: 'Gram-Negative', color: 'pink',   fid: currentPoint?.gn, best: BEST_FID_GN },
          ].map(({ type, label, color, fid, best }) => {
            const textColor = color === 'violet' ? 'text-violet-400' : 'text-pink-400'
            const borderColor = color === 'violet' ? 'border-violet-500/30' : 'border-pink-500/30'
            const bgColor = color === 'violet' ? 'bg-violet-500/10' : 'bg-pink-500/10'
            const isBest = selectedTick === best.tick
            return (
              <div key={type} className={`rounded-2xl border ${borderColor} ${bgColor} p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`font-semibold ${textColor}`}>{label} Generator</h3>
                    <p className="text-xs text-gray-500">Tick {selectedTick}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono text-xl font-bold ${textColor}`}>{fid?.toFixed(2) ?? '—'}</p>
                    <p className="text-xs text-gray-500">FID Score</p>
                  </div>
                </div>

                <div className="aspect-square w-full max-w-[256px] mx-auto mb-4">
                  <BacteriaCanvas type={type} tick={selectedTick} width={256} height={256} />
                </div>

                {isBest && (
                  <div className={`flex items-center gap-2 rounded-lg border ${borderColor} px-3 py-2 text-xs ${textColor}`}>
                    <Target className="h-3.5 w-3.5 flex-shrink-0" />
                    Best checkpoint — selected for synthetic data generation
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Stats row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { icon: <TrendingDown className="h-5 w-5" />, label: 'GN Best FID', value: BEST_FID_GN.value, sub: `Tick ${BEST_FID_GN.tick} · ${Math.round((1 - BEST_FID_GN.value / BENCHMARK_GN) * 100)}% below benchmark`, color: 'text-pink-400' },
            { icon: <TrendingDown className="h-5 w-5" />, label: 'GP Best FID', value: BEST_FID_GP.value, sub: `Tick ${BEST_FID_GP.tick} · ${Math.round((1 - BEST_FID_GP.value / BENCHMARK_GP) * 100)}% below benchmark`, color: 'text-violet-400' },
            { icon: <Clock className="h-5 w-5" />,        label: 'Training Duration', value: '1,000', sub: 'ticks per class', color: 'text-indigo-400' },
            { icon: <Zap className="h-5 w-5" />,          label: 'Rapid Convergence', value: '50', sub: 'ticks to sub-26 FID', color: 'text-amber-400' },
          ].map(({ icon, label, value, sub, color }) => (
            <div key={label} className="rounded-xl border border-white/10 bg-gray-900/60 p-4">
              <div className={`${color} mb-2`}>{icon}</div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Hyperparameters table */}
        <div className="rounded-2xl border border-white/10 bg-gray-900/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="font-semibold">StyleGAN2-ADA Hyperparameters</h2>
            <p className="text-xs text-gray-500 mt-0.5">Official NVlabs PyTorch implementation — no modifications</p>
          </div>
          <div className="divide-y divide-white/5">
            {ganHyperparams.map(({ param, value }) => (
              <div key={param} className="flex items-center justify-between px-6 py-3 hover:bg-white/2 transition-colors">
                <span className="text-sm text-gray-400">{param}</span>
                <span className="text-sm font-mono text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

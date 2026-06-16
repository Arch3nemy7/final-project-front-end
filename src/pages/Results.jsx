import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Cell,
} from 'recharts'
import { AlertTriangle, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { f1Scenarios, architectureRadar, scenarioMeanF1 } from '../data/metrics'

const SCENARIO_COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe']
const ARCH_COLORS = {
  'ResNet-50':    '#f59e0b',
  'DenseNet-121': '#10b981',
  'VGG-16':       '#ef4444',
  'MobileNetV3':  '#3b82f6',
  'InceptionV3':  '#8b5cf6',
}

const ARCH_RADAR_KEYS = {
  'ResNet-50':    'ResNet',
  'DenseNet-121': 'DenseNet',
  'VGG-16':       'VGG',
  'MobileNetV3':  'MobileNet',
  'InceptionV3':  'Inception',
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/10 bg-gray-900 px-3 py-2 text-xs shadow-xl min-w-[160px]">
      <p className="text-gray-400 mb-1.5 font-medium">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-mono">
          {p.name}: {typeof p.value === 'number' ? (p.value * (p.value <= 1 ? 100 : 1)).toFixed(2) + '%' : p.value}
        </p>
      ))}
    </div>
  )
}

// ─── Trend icon ───────────────────────────────────────────────────────────────
function Trend({ base, current, collapse }) {
  if (collapse) return <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
  const diff = current - base
  if (Math.abs(diff) < 0.0005) return <Minus className="h-3.5 w-3.5 text-gray-400" />
  if (diff > 0) return <TrendingUp className="h-3.5 w-3.5 text-green-400" />
  return <TrendingDown className="h-3.5 w-3.5 text-red-400" />
}

// ─── F1 table row ─────────────────────────────────────────────────────────────
function F1Row({ architecture, s1, s2, s3, s4, collapse }) {
  const scenarios = [
    { key: 'S1', val: s1, base: s1 },
    { key: 'S2', val: s2, base: s1 },
    { key: 'S3', val: s3, base: s1, isCollapse: collapse && s3 < 0.5 },
    { key: 'S4', val: s4, base: s1, isCollapse: collapse && s4 < 0.5 },
  ]

  return (
    <tr className="border-t border-white/5 hover:bg-white/2 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
            style={{ background: ARCH_COLORS[architecture] }}
          />
          <span className="text-sm font-medium text-white">{architecture}</span>
        </div>
      </td>
      {scenarios.map(({ key, val, base, isCollapse }) => (
        <td key={key} className="px-4 py-3 text-sm font-mono text-center">
          {isCollapse ? (
            <span className="inline-flex items-center gap-1 text-red-400">
              <AlertTriangle className="h-3 w-3" />
              collapse
            </span>
          ) : (
            <div className="flex items-center justify-center gap-1.5">
              <span className={val === base ? 'text-gray-300' : val > base ? 'text-green-400' : 'text-red-400'}>
                {(val * 100).toFixed(2)}%
              </span>
              <Trend base={base} current={val} collapse={isCollapse} />
            </div>
          )}
        </td>
      ))}
    </tr>
  )
}

// ─── Grouped bar data builder ─────────────────────────────────────────────────
const barData = f1Scenarios
  .filter(d => !d.collapse || d.s2 > 0.5)
  .map(d => ({
    name: d.architecture.replace('-', '\u200b-'),
    'Sc. I':   parseFloat((d.s1 * 100).toFixed(2)),
    'Sc. II':  parseFloat((d.s2 * 100).toFixed(2)),
    'Sc. III': (d.collapse && d.s3 < 0.5) ? null : parseFloat((d.s3 * 100).toFixed(2)),
    'Sc. IV':  (d.collapse && d.s4 < 0.5) ? null : parseFloat((d.s4 * 100).toFixed(2)),
  }))

// Scenario trend lines (non-collapsed archs)
const trendData = [
  { label: 'Sc. I',   pct: 0 },
  { label: 'Sc. II',  pct: 25 },
  { label: 'Sc. III', pct: 50 },
  { label: 'Sc. IV',  pct: 75 },
].map((s, si) => {
  const row = { label: s.label, synthetic: s.pct }
  f1Scenarios.forEach(d => {
    const vals = [d.s1, d.s2, d.s3, d.s4]
    const v = vals[si]
    row[d.architecture] = (!d.collapse || v > 0.5) ? parseFloat((v * 100).toFixed(2)) : null
  })
  return row
})

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Results() {
  const [view, setView] = useState('bar') // 'bar' | 'trend' | 'radar'

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-24 pb-24 px-4">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-2">Scenarios I–IV — Classification Feasibility</p>
          <h1 className="text-3xl font-bold">Classification Results</h1>
          <p className="mt-2 text-gray-400 max-w-2xl">
            Macro-averaged F1-Score across five CNN architectures and four real-to-synthetic
            composition scenarios. VGG-16 collapsed (majority-class prediction) at 50% and 75% synthetic.
          </p>
        </div>

        {/* Key finding banner */}
        <div className="mb-8 rounded-2xl border border-amber-500/25 bg-amber-500/8 p-5 flex gap-4">
          <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300">Study Hypothesis Not Supported</p>
            <p className="text-sm text-gray-400 mt-1">
              With the sole exception of VGG-16 at 25% synthetic (+0.50%), all augmented scenarios
              resulted in F1-Score <span className="text-white">decline</span> relative to the 100% real baseline
              across all architectures.
            </p>
          </div>
        </div>

        {/* Chart switcher */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'bar',   label: 'Architecture Comparison' },
            { key: 'trend', label: 'Scenario Trend' },
            { key: 'radar', label: 'Baseline Radar' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                view === key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Charts */}
        <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-6 mb-8">
          {view === 'bar' && (
            <>
              <h2 className="font-semibold mb-1">F1-Score by Architecture × Scenario</h2>
              <p className="text-xs text-gray-500 mb-5">Higher is better. VGG-16 Sc. III &amp; IV excluded (model collapse).</p>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} domain={[80, 100]} tickFormatter={v => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
                  {['Sc. I', 'Sc. II', 'Sc. III', 'Sc. IV'].map((s, i) => (
                    <Bar key={s} dataKey={s} fill={SCENARIO_COLORS[i]} radius={[3, 3, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </>
          )}

          {view === 'trend' && (
            <>
              <h2 className="font-semibold mb-1">F1-Score Trend Across Synthetic Proportion</h2>
              <p className="text-xs text-gray-500 mb-5">All non-collapsed architectures show monotonic decline as synthetic proportion increases.</p>
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="label" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} domain={[88, 97]} tickFormatter={v => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
                  {f1Scenarios.map(d => (
                    <Line
                      key={d.architecture}
                      type="monotone"
                      dataKey={d.architecture}
                      stroke={ARCH_COLORS[d.architecture]}
                      strokeWidth={2}
                      dot={{ r: 4, fill: ARCH_COLORS[d.architecture] }}
                      connectNulls={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </>
          )}

          {view === 'radar' && (
            <>
              <h2 className="font-semibold mb-1">Scenario I Baseline — Multi-Metric Comparison</h2>
              <p className="text-xs text-gray-500 mb-5">F1-Score, Accuracy, Precision, Recall at 100% real training data.</p>
              <ResponsiveContainer width="100%" height={340}>
                <RadarChart data={architectureRadar} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                  <PolarGrid stroke="#1f2937" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[80, 100]} tick={{ fill: '#6b7280', fontSize: 9 }} />
                  {Object.entries(ARCH_COLORS).map(([arch, color]) => (
                    <Radar
                      key={arch}
                      name={arch}
                      dataKey={ARCH_RADAR_KEYS[arch]}
                      stroke={color}
                      fill={color}
                      fillOpacity={0.08}
                      strokeWidth={1.5}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                </RadarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

        {/* Detailed F1 table */}
        <div className="rounded-2xl border border-white/10 bg-gray-900/60 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="font-semibold">Macro-Averaged F1-Score — Full Table</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Sc. I = 100% Real &nbsp;·&nbsp; Sc. II = 75%R/25%S &nbsp;·&nbsp; Sc. III = 50%R/50%S &nbsp;·&nbsp; Sc. IV = 25%R/75%S
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="px-4 py-3">Architecture</th>
                  <th className="px-4 py-3 text-center">Scenario I</th>
                  <th className="px-4 py-3 text-center">Scenario II</th>
                  <th className="px-4 py-3 text-center">Scenario III</th>
                  <th className="px-4 py-3 text-center">Scenario IV</th>
                </tr>
              </thead>
              <tbody>
                {f1Scenarios.map(d => (
                  <F1Row key={d.architecture} {...d} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Architecture analysis cards */}
        <h2 className="text-xl font-bold mb-5">Per-Architecture Analysis</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {[
            {
              name: 'ResNet-50',
              color: ARCH_COLORS['ResNet-50'],
              baseline: '94.25%',
              finding: 'Monotonic decline: −1.80% (Sc.II), −2.75% (Sc.III), −4.17% (Sc.IV). Early best-epoch checkpoints indicate overfitting under synthetic loading.',
              verdict: 'decline',
            },
            {
              name: 'DenseNet-121',
              color: ARCH_COLORS['DenseNet-121'],
              baseline: '94.66%',
              finding: 'Highest baseline F1. Monotonic decline ending at −5.08% (Sc.IV) — the largest among non-collapsed architectures.',
              verdict: 'decline',
            },
            {
              name: 'VGG-16',
              color: ARCH_COLORS['VGG-16'],
              baseline: '84.97%',
              finding: 'Only architecture with any improvement: +0.50% at Sc.II. Model collapsed (majority-class prediction) at Sc.III and Sc.IV.',
              verdict: 'mixed',
            },
            {
              name: 'MobileNetV3',
              color: ARCH_COLORS['MobileNetV3'],
              baseline: '94.64%',
              finding: 'Monotonic decline. Depthwise-separable convolutions appear susceptible to distributional shift from synthetic data.',
              verdict: 'decline',
            },
            {
              name: 'InceptionV3',
              color: ARCH_COLORS['InceptionV3'],
              baseline: '93.23%',
              finding: 'Monotonic decline. Multi-scale Inception modules do not confer consistent robustness to StyleGAN2-ADA generated images.',
              verdict: 'decline',
            },
          ].map(({ name, color, baseline, finding, verdict }) => (
            <div key={name} className="rounded-xl border border-white/10 bg-gray-900/60 p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: color }} />
                <h3 className="font-semibold text-white">{name}</h3>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                  verdict === 'mixed'
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-red-500/15 text-red-400'
                }`}>
                  {verdict === 'mixed' ? 'Mixed' : 'Decline'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">Baseline F1: <span className="text-white font-mono">{baseline}</span></p>
              <p className="text-sm text-gray-400 leading-relaxed">{finding}</p>
            </div>
          ))}
        </div>

        {/* Mean F1 by scenario */}
        <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-6">
          <h2 className="font-semibold mb-1">Mean F1 Across Non-Collapsed Architectures</h2>
          <p className="text-xs text-gray-500 mb-5">Excludes VGG-16 Sc.III &amp; IV (collapse). Shows degradation with increasing synthetic proportion.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Scenario I', pct: ((0.9425+0.9466+0.9464+0.9323)/4*100).toFixed(2), sub: '100% Real', color: 'indigo' },
              { label: 'Scenario II', pct: ((0.9245+0.9431+0.9335+0.9247)/4*100).toFixed(2), sub: '75%R / 25%S', color: 'blue' },
              { label: 'Scenario III', pct: ((0.9150+0.9320+0.9105+0.9202)/4*100).toFixed(2), sub: '50%R / 50%S', color: 'violet' },
              { label: 'Scenario IV', pct: ((0.9008+0.8958+0.9115+0.8980)/4*100).toFixed(2), sub: '25%R / 75%S', color: 'red' },
            ].map(({ label, pct, sub, color }) => {
              const barMap = { indigo: 'bg-indigo-500', blue: 'bg-blue-500', violet: 'bg-violet-500', red: 'bg-red-500' }
              const textMap = { indigo: 'text-indigo-400', blue: 'text-blue-400', violet: 'text-violet-400', red: 'text-red-400' }
              return (
                <div key={label} className="rounded-xl border border-white/10 bg-gray-800/40 p-4">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className={`text-2xl font-bold font-mono ${textMap[color]}`}>{pct}%</p>
                  <p className="text-xs text-gray-600 mt-0.5">{sub}</p>
                  <div className="h-1.5 w-full rounded-full bg-gray-700 mt-2">
                    <div
                      className={`h-full rounded-full ${barMap[color]}`}
                      style={{ width: `${(pct - 88) / (96 - 88) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}

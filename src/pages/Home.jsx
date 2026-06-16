import { Link } from 'react-router-dom'
import { ArrowRight, FlaskConical, Brain, BarChart3, BookOpen, ChevronRight } from 'lucide-react'
import { BEST_FID_GN, BEST_FID_GP, BENCHMARK_GN, BENCHMARK_GP, datasetStats } from '../data/metrics'

// ─── Bacteria microscopy SVG illustration ────────────────────────────────────
function MicroscopyHero() {
  const positiveCells = [
    { cx: 120, cy: 90,  rx: 14, ry: 9,  rot: 20  },
    { cx: 160, cy: 130, rx: 10, ry: 7,  rot: -10 },
    { cx: 85,  cy: 145, rx: 13, ry: 8,  rot: 45  },
    { cx: 200, cy: 75,  rx: 8,  ry: 8,  rot: 0   },
    { cx: 140, cy: 165, rx: 11, ry: 7,  rot: 30  },
    { cx: 65,  cy: 110, rx: 9,  ry: 6,  rot: -20 },
    { cx: 225, cy: 140, rx: 10, ry: 9,  rot: 15  },
    { cx: 175, cy: 190, rx: 12, ry: 8,  rot: -35 },
    { cx: 110, cy: 185, rx: 8,  ry: 8,  rot: 0   },
    { cx: 240, cy: 100, rx: 11, ry: 7,  rot: 50  },
  ]

  const negativeCells = [
    { cx: 300, cy: 80,  len: 28, rot: 30  },
    { cx: 340, cy: 120, len: 34, rot: -15 },
    { cx: 280, cy: 150, len: 22, rot: 70  },
    { cx: 370, cy: 90,  len: 30, rot: -40 },
    { cx: 315, cy: 175, len: 26, rot: 20  },
    { cx: 350, cy: 155, len: 32, rot: -60 },
    { cx: 260, cy: 105, len: 20, rot: 80  },
    { cx: 385, cy: 165, len: 24, rot: 10  },
    { cx: 330, cy: 60,  len: 28, rot: -25 },
    { cx: 295, cy: 190, len: 22, rot: 55  },
  ]

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Glow orbs */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-48 w-48 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="h-48 w-48 rounded-full bg-pink-600/20 blur-3xl ml-16" />
      </div>

      <div className="relative rounded-2xl border border-white/10 bg-gray-950/80 backdrop-blur overflow-hidden shadow-2xl">
        {/* Microscope lens vignette */}
        <div className="absolute inset-0 rounded-2xl"
          style={{ background: 'radial-gradient(ellipse at center, transparent 55%, #030712 100%)' }}
        />

        {/* Scan line animation */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="animate-scan h-px w-full bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />
        </div>

        <svg viewBox="0 0 460 250" className="w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="gp-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.6" />
            </radialGradient>
            <radialGradient id="gn-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f9a8d4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#be185d" stopOpacity="0.6" />
            </radialGradient>
            <filter id="blur-soft">
              <feGaussianBlur stdDeviation="0.5" />
            </filter>
            <filter id="glow-gp">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background noise texture */}
          <rect width="460" height="250" fill="#060912" />

          {/* Divider label */}
          <line x1="255" y1="10" x2="255" y2="240" stroke="#ffffff18" strokeWidth="1" strokeDasharray="4 4" />
          <text x="128" y="22" textAnchor="middle" fill="#a78bfa99" fontSize="9" fontFamily="monospace">GRAM-POSITIVE</text>
          <text x="358" y="22" textAnchor="middle" fill="#f472b699" fontSize="9" fontFamily="monospace">GRAM-NEGATIVE</text>

          {/* Gram-positive cocci (round/oval purple) */}
          {positiveCells.map((c, i) => (
            <g key={i} transform={`rotate(${c.rot} ${c.cx} ${c.cy})`} filter="url(#blur-soft)">
              <ellipse cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} fill="url(#gp-grad)" opacity="0.85" />
              {/* Inner highlight */}
              <ellipse cx={c.cx - c.rx * 0.25} cy={c.cy - c.ry * 0.3} rx={c.rx * 0.35} ry={c.ry * 0.3} fill="#e9d5ff" opacity="0.4" />
            </g>
          ))}

          {/* Gram-negative bacilli (rod-shaped pink) */}
          {negativeCells.map((c, i) => (
            <g key={i} transform={`rotate(${c.rot} ${c.cx} ${c.cy})`} filter="url(#blur-soft)">
              <rect
                x={c.cx - c.len / 2}
                y={c.cy - 4}
                width={c.len}
                height={8}
                rx={4}
                ry={4}
                fill="url(#gn-grad)"
                opacity="0.85"
              />
              {/* Inner highlight */}
              <rect
                x={c.cx - c.len / 2 + 3}
                y={c.cy - 2}
                width={c.len - 8}
                height={3}
                rx={2}
                fill="#fecdd3"
                opacity="0.35"
              />
            </g>
          ))}

          {/* Legend */}
          <g transform="translate(10, 228)">
            <ellipse cx="8" cy="5" rx="7" ry="5" fill="#7c3aed" opacity="0.8" />
            <text x="18" y="9" fill="#a78bfa" fontSize="8" fontFamily="monospace">Cocci (GP)</text>
          </g>
          <g transform="translate(100, 228)">
            <rect x="1" y="2" width="14" height="6" rx="3" fill="#be185d" opacity="0.8" />
            <text x="18" y="9" fill="#f472b6" fontSize="8" fontFamily="monospace">Bacilli (GN)</text>
          </g>
          <text x="400" y="236" fill="#ffffff22" fontSize="8" fontFamily="monospace">256×256px</text>
        </svg>

        {/* Label pill */}
        <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-gray-400 font-mono border border-white/10">
          Synthetic · StyleGAN2-ADA
        </div>
      </div>
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = 'indigo', icon }) {
  const colors = {
    indigo: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
    violet: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
    pink:   'border-pink-500/30   bg-pink-500/10   text-pink-300',
    green:  'border-green-500/30  bg-green-500/10  text-green-300',
  }
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium opacity-70 uppercase tracking-wider">{label}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
          {sub && <p className="mt-1 text-xs opacity-60">{sub}</p>}
        </div>
        {icon && <div className="opacity-40">{icon}</div>}
      </div>
    </div>
  )
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, description, to }) {
  return (
    <Link
      to={to}
      className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-gray-900/60 p-6 hover:border-indigo-500/40 hover:bg-gray-900 transition-all"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 group-hover:bg-indigo-600/30 transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="mt-1.5 text-sm text-gray-400 leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center gap-1 text-sm text-indigo-400 mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
        Explore <ChevronRight className="h-4 w-4" />
      </div>
    </Link>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-28 pb-20 px-4">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
          <div className="absolute top-20 right-1/4 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Final Project — EEPIS 2025
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
              Synthetic Bacteria Images<br />
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                via StyleGAN2-ADA
              </span>
            </h1>

            <p className="mt-5 text-lg text-gray-400 leading-relaxed max-w-xl">
              A data augmentation framework that generates high-fidelity synthetic Gram-stained
              microscopy images to address scarcity of annotated clinical training data.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/generator"
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                View Generator <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/results"
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                See Results <BarChart3 className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Illustration */}
          <MicroscopyHero />
        </div>
      </section>

      {/* ── Key Metrics ── */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Key Results</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Best FID — Gram-Negative"
              value={BEST_FID_GN.value}
              sub={`Tick ${BEST_FID_GN.tick} · Benchmark: ${BENCHMARK_GN}`}
              color="pink"
              icon={<FlaskConical className="h-6 w-6" />}
            />
            <StatCard
              label="Best FID — Gram-Positive"
              value={BEST_FID_GP.value}
              sub={`Tick ${BEST_FID_GP.tick} · Benchmark: ${BENCHMARK_GP}`}
              color="violet"
              icon={<FlaskConical className="h-6 w-6" />}
            />
            <StatCard
              label="Best F1-Score (Baseline)"
              value="94.66%"
              sub="DenseNet-121 · Scenario I (100% Real)"
              color="green"
              icon={<Brain className="h-6 w-6" />}
            />
            <StatCard
              label="Training Dataset"
              value={datasetStats.total.toLocaleString()}
              sub={`${datasetStats.gramNegative.toLocaleString()} GN · ${datasetStats.gramPositive.toLocaleString()} GP crops`}
              color="indigo"
              icon={<BookOpen className="h-6 w-6" />}
            />
          </div>
        </div>
      </section>

      {/* ── FID Improvement callout ── */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-7xl rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-950/60 to-violet-950/60 p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold">Surpassing Medical Imaging Benchmarks</h2>
              <p className="mt-3 text-gray-400 leading-relaxed">
                Both generators achieved FID scores well below the{' '}
                <span className="text-pink-400 font-semibold">{BENCHMARK_GN}</span> (GN) and{' '}
                <span className="text-violet-400 font-semibold">{BENCHMARK_GP}</span> (GP) good-quality
                thresholds established by Woodland et al. for synthetic medical images.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Gram-Negative FID', achieved: BEST_FID_GN.value, benchmark: BENCHMARK_GN, color: 'pink' },
                { label: 'Gram-Positive FID', achieved: BEST_FID_GP.value, benchmark: BENCHMARK_GP, color: 'violet' },
              ].map(({ label, achieved, benchmark, color }) => {
                const pct = Math.round((1 - achieved / benchmark) * 100)
                const barColor = color === 'pink' ? 'bg-pink-500' : 'bg-violet-500'
                const textColor = color === 'pink' ? 'text-pink-400' : 'text-violet-400'
                return (
                  <div key={label} className="rounded-xl border border-white/10 bg-gray-900/60 p-4">
                    <p className="text-xs text-gray-400 mb-2">{label}</p>
                    <div className="flex items-end gap-1.5 mb-2">
                      <span className={`text-2xl font-bold ${textColor}`}>{achieved}</span>
                      <span className="text-xs text-gray-500 pb-0.5">vs {benchmark}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-800">
                      <div
                        className={`h-full rounded-full ${barColor}`}
                        style={{ width: `${100 - (achieved / benchmark * 100)}%` }}
                      />
                    </div>
                    <p className={`text-xs mt-1 ${textColor}`}>{pct}% below benchmark</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature navigation cards ── */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-xl font-bold mb-6">Explore the Research</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              to="/generator"
              icon={<FlaskConical className="h-5 w-5" />}
              title="Image Generator"
              description="Explore synthetic Gram-stained bacteria images produced by the StyleGAN2-ADA model and track the FID convergence across 1,000 training ticks."
            />
            <FeatureCard
              to="/results"
              icon={<BarChart3 className="h-5 w-5" />}
              title="Classification Results"
              description="Compare macro-averaged F1-Scores across five CNN architectures and four real-to-synthetic training composition scenarios."
            />
            <FeatureCard
              to="/methods"
              icon={<BookOpen className="h-5 w-5" />}
              title="Methodology"
              description="Understand the full pipeline — from multi-source dataset construction and annotation-guided preprocessing to conditional GAN training and CNN evaluation."
            />
          </div>
        </div>
      </section>

      {/* ── Research finding callout ── */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 mb-4">
              <Brain className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-amber-300">Key Finding: Fidelity ≠ Utility</h3>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              Despite high visual fidelity (FID &lt; 8), incorporating synthetic images into CNN training
              generally <span className="text-white font-medium">did not improve</span> classification
              performance. Only VGG-16 at 25% synthetic showed a marginal gain (+0.50%), followed by
              collapse at higher proportions — highlighting a divergence between generative image
              quality and downstream classification utility.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

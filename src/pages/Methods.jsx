import { useState } from 'react'
import { Database, Scissors, Cpu, BarChart3, ChevronRight, ChevronDown, Users } from 'lucide-react'
import { datasetStats, ganHyperparams } from '../data/metrics'

// ─── Pipeline step component ──────────────────────────────────────────────────
function PipelineStep({ number, icon, title, description, details, color = 'indigo' }) {
  const [expanded, setExpanded] = useState(false)
  const colors = {
    indigo: { ring: 'ring-indigo-500/40', bg: 'bg-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-500/20' },
    violet: { ring: 'ring-violet-500/40', bg: 'bg-violet-500/15', text: 'text-violet-300', border: 'border-violet-500/20' },
    pink:   { ring: 'ring-pink-500/40',   bg: 'bg-pink-500/15',   text: 'text-pink-300',   border: 'border-pink-500/20'   },
    green:  { ring: 'ring-green-500/40',  bg: 'bg-green-500/15',  text: 'text-green-300',  border: 'border-green-500/20'  },
  }
  const c = colors[color]
  return (
    <div className={`rounded-2xl border ${c.border} bg-gray-900/60`}>
      <button
        className="w-full flex items-start gap-5 p-5 text-left"
        onClick={() => setExpanded(v => !v)}
      >
        <div className={`flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${c.ring} ${c.bg} ${c.text}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono font-semibold ${c.text}`}>Phase {number}</span>
          </div>
          <h3 className="font-semibold text-white mt-0.5">{title}</h3>
          <p className="text-sm text-gray-400 mt-1 leading-relaxed">{description}</p>
        </div>
        <div className={`flex-shrink-0 mt-1 ${c.text}`}>
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className={`border-t ${c.border} px-5 pb-5 pt-4`}>
          {details}
        </div>
      )}
    </div>
  )
}

// ─── Architecture card ────────────────────────────────────────────────────────
function ArchCard({ name, color, params, note }) {
  return (
    <div className="rounded-xl border border-white/10 bg-gray-800/40 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        <h4 className="text-sm font-semibold text-white">{name}</h4>
      </div>
      <p className="text-xs text-gray-500">{params}</p>
      <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{note}</p>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function Methods() {
  return (
    <div className="min-h-screen bg-gray-950 text-white pt-24 pb-24 px-4">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-2">Section III — Methodology</p>
          <h1 className="text-3xl font-bold">Research Pipeline</h1>
          <p className="mt-2 text-gray-400 max-w-2xl">
            Four-phase methodology: dataset construction, conditional StyleGAN2-ADA training,
            combined dataset scenarios, and multi-architecture CNN evaluation.
          </p>
        </div>

        {/* Pipeline overview visual */}
        <div className="mb-10 rounded-2xl border border-white/10 bg-gray-900/60 p-6 overflow-x-auto">
          <h2 className="font-semibold mb-6">System Workflow</h2>
          <div className="flex items-center gap-2 min-w-[720px]">
            {[
              { label: 'Raw Clinical\nImages', sub: '1,705 + 505 images', color: 'bg-indigo-600' },
              { label: 'Crop &\nResize', sub: '→ 256×256 px', color: 'bg-violet-600' },
              { label: 'StyleGAN2-ADA\nTraining', sub: '1,000 ticks/class', color: 'bg-pink-600' },
              { label: 'Scenario\nMixing', sub: '4 compositions', color: 'bg-orange-500' },
              { label: 'CNN\nTraining', sub: '5 architectures', color: 'bg-amber-500' },
              { label: 'F1-Score\nEvaluation', sub: 'macro-averaged', color: 'bg-green-600' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`flex-1 rounded-xl ${step.color} px-3 py-3 text-center`}>
                  <p className="text-xs font-semibold text-white leading-snug whitespace-pre">{step.label}</p>
                  <p className="text-[10px] text-white/60 mt-1">{step.sub}</p>
                </div>
                {i < 5 && <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Expandable phases */}
        <div className="flex flex-col gap-4 mb-10">
          <PipelineStep
            number="1"
            color="indigo"
            icon={<Database className="h-5 w-5" />}
            title="Dataset Construction"
            description="Multi-source clinical dataset combining two publicly available Gram-stained bacteria image collections from PLA General Hospital and Peking Union Medical College Hospital."
            details={
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {datasetStats.sources.map(s => (
                    <div key={s.name} className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                      <h4 className="text-sm font-semibold text-indigo-300">{s.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{s.type}</p>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-lg font-bold text-white">{s.total.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Total</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-violet-400">{s.gp.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">GP crops</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-pink-400">{s.gn.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">GN crops</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: 'Combined Total', value: datasetStats.total.toLocaleString(), color: 'text-white' },
                    { label: 'Training Set', value: datasetStats.trainTotal.toLocaleString(), color: 'text-indigo-400' },
                    { label: 'Val + Test', value: `${datasetStats.valTotal.toLocaleString()} each`, color: 'text-gray-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-xl border border-white/10 bg-gray-800/40 py-3">
                      <p className={`text-xl font-bold font-mono ${color}`}>{value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Annotations are expert-validated bounding boxes published with each dataset
                  (YOLO format for Wang et al.; COCO JSON for Yi et al., converted with
                  ImageAnnotationTools). The test set is isolated before any GAN or CNN training.
                </p>
              </div>
            }
          />

          <PipelineStep
            number="2"
            color="violet"
            icon={<Scissors className="h-5 w-5" />}
            title="Annotation-Guided Preprocessing"
            description="Individual bacterial cells are extracted from full-resolution images using expert-validated bounding box coordinates, then standardized to 256×256 px via bicubic interpolation."
            details={
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm">
                  {[
                    { label: 'Wang et al. resolution', value: '4,912 × 3,684 px' },
                    { label: 'Yi et al. resolution', value: '5,472 × 3,648 px' },
                    { label: 'Output resolution', value: '256 × 256 px' },
                    { label: 'Interpolation', value: 'Bicubic' },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-3 py-3">
                      <p className="font-mono font-semibold text-violet-300">{value}</p>
                      <p className="text-xs text-gray-500 mt-1">{label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Annotations are not produced by a detection model — they are the ground-truth
                  bounding boxes provided directly by the dataset authors and validated by certified
                  expert microbiologists and laboratory medicine specialists.
                </p>
              </div>
            }
          />

          <PipelineStep
            number="3"
            color="pink"
            icon={<Cpu className="h-5 w-5" />}
            title="Conditional StyleGAN2-ADA Training"
            description="Two independent class-conditional generators trained using the official NVlabs PyTorch implementation without modification. ADA dynamically adjusts discriminator augmentation to prevent overfitting on limited data."
            details={
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Architecture summary */}
                  <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-4">
                    <h4 className="text-sm font-semibold text-pink-300 mb-3">Generator Architecture</h4>
                    <ul className="space-y-1.5 text-xs text-gray-400">
                      <li className="flex gap-2"><span className="text-pink-400">→</span> Latent code z (512-dim) through mapping network</li>
                      <li className="flex gap-2"><span className="text-pink-400">→</span> Intermediate style vector w</li>
                      <li className="flex gap-2"><span className="text-pink-400">→</span> Adaptive Instance Normalization (AdaIN) at each resolution</li>
                      <li className="flex gap-2"><span className="text-pink-400">→</span> Class labels as conditional inputs to G and D</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-4">
                    <h4 className="text-sm font-semibold text-pink-300 mb-3">ADA Mechanism</h4>
                    <ul className="space-y-1.5 text-xs text-gray-400">
                      <li className="flex gap-2"><span className="text-pink-400">→</span> Pipeline: bgc (blitting, geometry, color)</li>
                      <li className="flex gap-2"><span className="text-pink-400">→</span> Target augmentation probability: 0.6</li>
                      <li className="flex gap-2"><span className="text-pink-400">→</span> Non-leaking: only discriminator input augmented</li>
                      <li className="flex gap-2"><span className="text-pink-400">→</span> Addresses limited-data GAN training instability</li>
                    </ul>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {ganHyperparams.slice(0, 4).map(({ param, value }) => (
                    <div key={param} className="rounded-lg border border-white/10 bg-gray-800/40 px-3 py-2 text-center">
                      <p className="text-sm font-mono font-semibold text-white">{value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{param}</p>
                    </div>
                  ))}
                </div>
              </div>
            }
          />

          <PipelineStep
            number="4"
            color="green"
            icon={<BarChart3 className="h-5 w-5" />}
            title="Multi-Architecture CNN Evaluation"
            description="Five CNN architectures evaluate classification feasibility across four composition scenarios. Training set size held constant; only real-to-synthetic ratio varies."
            details={
              <div className="space-y-4">
                {/* Scenarios */}
                <div>
                  <h4 className="text-sm font-semibold text-green-300 mb-3">Composition Scenarios</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Scenario I',   real: 100, syn: 0,  color: 'bg-indigo-500' },
                      { label: 'Scenario II',  real: 75,  syn: 25, color: 'bg-violet-500' },
                      { label: 'Scenario III', real: 50,  syn: 50, color: 'bg-pink-500' },
                      { label: 'Scenario IV',  real: 25,  syn: 75, color: 'bg-red-500' },
                    ].map(({ label, real, syn, color }) => (
                      <div key={label} className="rounded-xl border border-white/10 bg-gray-800/40 p-3 text-center">
                        <p className="text-xs font-medium text-gray-300 mb-2">{label}</p>
                        <div className="h-2.5 w-full rounded-full bg-gray-700 overflow-hidden flex">
                          <div className="bg-indigo-500 h-full transition-all" style={{ width: `${real}%` }} />
                          <div className={`h-full transition-all ${syn > 0 ? color : ''}`} style={{ width: `${syn}%` }} />
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">{real}% Real / {syn}% Syn</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Architectures */}
                <div>
                  <h4 className="text-sm font-semibold text-green-300 mb-3">CNN Architectures</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <ArchCard name="ResNet-50" color="#f59e0b"
                      params="25.6M params · Residual skip connections"
                      note="Skip connections sensitive to distributional shift from synthetic data. Monotonic decline across all augmented scenarios." />
                    <ArchCard name="DenseNet-121" color="#10b981"
                      params="8.0M params · Dense connections"
                      note="Highest Scenario I baseline (0.9466). Largest non-collapsed decline at Sc.IV (−5.08%)." />
                    <ArchCard name="VGG-16" color="#ef4444"
                      params="138M params · Deep sequential conv"
                      note="Only architecture with any improvement (+0.50% at Sc.II). Collapsed at 50% and 75% synthetic." />
                    <ArchCard name="MobileNetV3" color="#3b82f6"
                      params="5.4M params · Depthwise-separable convolutions"
                      note="Efficient architecture for small datasets. Depthwise separable convolutions susceptible to domain gap." />
                    <ArchCard name="InceptionV3" color="#8b5cf6"
                      params="27.2M params · Multi-scale Inception modules"
                      note="Multi-scale features do not confer consistent robustness to StyleGAN2-ADA synthetic images." />
                  </div>
                </div>

                {/* Common CNN hyperparams */}
                <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                  <h4 className="text-sm font-semibold text-green-300 mb-3">Common Training Hyperparameters</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 text-xs">
                    {[
                      ['Optimizer', 'Adam'],
                      ['Learning Rate', '1×10⁻³'],
                      ['Batch Size', '32'],
                      ['Pre-training', 'ImageNet (transfer learning)'],
                      ['Normalization', 'ImageNet mean/std'],
                      ['Loss', 'CrossEntropyLoss'],
                      ['Early Stopping', 'Best val F1-Score checkpoint'],
                      ['Input Size', '256 × 256 px'],
                      ['Output', 'Binary softmax (GP / GN)'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <span className="text-gray-500 shrink-0">{k}:</span>
                        <span className="text-gray-300 font-mono">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            }
          />
        </div>

        {/* Evaluation metrics */}
        <div className="mb-10 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-6">
            <h2 className="font-semibold mb-4">GAN Quality Metric — FID</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Fréchet Inception Distance (FID) measures the Fréchet distance between feature distributions
              of real and synthetic images extracted by Inception-v3. A fixed real reference distribution
              (full combined training set) is used consistently across all evaluations for comparability.
            </p>
            <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3">
              <p className="text-xs text-gray-400">Woodland et al. good-quality benchmarks</p>
              <div className="flex gap-6 mt-2">
                <div>
                  <p className="text-xl font-bold font-mono text-pink-400">10.78</p>
                  <p className="text-xs text-gray-500">Gram-Negative</p>
                </div>
                <div>
                  <p className="text-xl font-bold font-mono text-violet-400">21.17</p>
                  <p className="text-xs text-gray-500">Gram-Positive</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-6">
            <h2 className="font-semibold mb-4">Classification Metric — Macro F1-Score</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Macro-averaged F1-Score is the primary classification metric, chosen for its robustness
              under class imbalance (GN:GP ≈ 2.2:1). Accuracy is insensitive to minority-class performance
              under imbalance; F1-Score provides a balanced, clinically meaningful measure.
            </p>
            <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-xs text-gray-400">
              <p><span className="text-green-400 font-medium">Study hypothesis accepted</span> if any augmented scenario F1 ≥ Scenario I baseline.</p>
              <p className="mt-1 text-gray-500">→ Hypothesis not supported (only VGG-16 Sc.II: +0.50%)</p>
            </div>
          </div>
        </div>

        {/* Authors */}
        <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Users className="h-5 w-5 text-indigo-400" />
            <h2 className="font-semibold">Research Team</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Andrey Pratama Gunawan', role: 'Primary Author', email: 'andreypratamagunawan@student.pens.ac.id' },
              { name: 'Tita Karlita', role: 'Supervisor', email: 'EEPIS' },
              { name: 'Nana Ramadijanti', role: 'Supervisor', email: 'EEPIS' },
              { name: 'Ira Prasetyaningrum', role: 'Supervisor', email: 'EEPIS' },
            ].map(({ name, role, email }) => (
              <div key={name} className="rounded-xl border border-white/10 bg-gray-800/40 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600/30 text-indigo-300 text-sm font-bold mb-3">
                  {name[0]}
                </div>
                <p className="text-sm font-semibold text-white leading-snug">{name}</p>
                <p className="text-xs text-indigo-400 mt-0.5">{role}</p>
                <p className="text-xs text-gray-500 mt-1 truncate">{email}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-4">
            Department of Informatics Engineering (D4) · Electronic Engineering Polytechnic Institute of Surabaya (EEPIS) · Surabaya, Indonesia
          </p>
        </div>

      </div>
    </div>
  )
}

// ─── FID Training Progression ────────────────────────────────────────────────
export const fidProgression = [
  { tick: 0,    gn: 302.62, gp: 298.35 },
  { tick: 50,   gn: 18.46,  gp: 26.00  },
  { tick: 100,  gn: 15.11,  gp: 15.19  },
  { tick: 150,  gn: 13.68,  gp: 13.75  },
  { tick: 200,  gn: 12.83,  gp: 11.83  },
  { tick: 250,  gn: 13.86,  gp: 10.69  },
  { tick: 300,  gn: 12.60,  gp: 9.55   },
  { tick: 350,  gn: 13.14,  gp: 10.17  },
  { tick: 400,  gn: 11.34,  gp: 9.55   },
  { tick: 450,  gn: 10.82,  gp: 9.24   },
  { tick: 500,  gn: 10.88,  gp: 8.93   },
  { tick: 550,  gn: 9.74,   gp: 9.09   },
  { tick: 600,  gn: 8.88,   gp: 8.56   },
  { tick: 650,  gn: 9.81,   gp: 8.72   },
  { tick: 700,  gn: 9.86,   gp: 8.22   },
  { tick: 750,  gn: 8.91,   gp: 8.40   },
  { tick: 800,  gn: 8.72,   gp: 8.20   },
  { tick: 850,  gn: 7.88,   gp: 8.64   },
  { tick: 900,  gn: 7.35,   gp: 7.80   },
  { tick: 950,  gn: 7.88,   gp: 7.74   },
  { tick: 1000, gn: 7.63,   gp: 7.82   },
]

// Woodland et al. benchmark thresholds
export const BENCHMARK_GN = 10.78
export const BENCHMARK_GP = 21.17
export const BEST_FID_GN  = { value: 7.35, tick: 900 }
export const BEST_FID_GP  = { value: 7.74, tick: 950 }

// ─── F1-Score per Architecture × Scenario ────────────────────────────────────
export const f1Scenarios = [
  {
    architecture: 'ResNet-50',
    s1: 0.9425, s2: 0.9245, s3: 0.9150, s4: 0.9008,
    collapse: false,
  },
  {
    architecture: 'DenseNet-121',
    s1: 0.9466, s2: 0.9431, s3: 0.9320, s4: 0.8958,
    collapse: false,
  },
  {
    architecture: 'VGG-16',
    s1: 0.8497, s2: 0.8547, s3: 0.4064, s4: 0.4064,
    collapse: true,   // collapse at Sc. III & IV
  },
  {
    architecture: 'MobileNetV3',
    s1: 0.9464, s2: 0.9335, s3: 0.9105, s4: 0.9115,
    collapse: false,
  },
  {
    architecture: 'InceptionV3',
    s1: 0.9323, s2: 0.9247, s3: 0.9202, s4: 0.8980,
    collapse: false,
  },
]

// Radar / multi-axis comparison for Scenario I baseline
export const architectureRadar = [
  { metric: 'F1-Score', ResNet: 94.25, DenseNet: 94.66, VGG: 84.97, MobileNet: 94.64, Inception: 93.23 },
  { metric: 'Accuracy', ResNet: 95.07, DenseNet: 95.38, VGG: 86.77, MobileNet: 95.38, Inception: 94.23 },
  { metric: 'Precision', ResNet: 94.53, DenseNet: 94.57, VGG: 84.39, MobileNet: 94.73, Inception: 93.92 },
  { metric: 'Recall',   ResNet: 93.99, DenseNet: 94.76, VGG: 85.67, MobileNet: 94.55, Inception: 92.61 },
]

// Scenario-level aggregated F1 for bar chart (non-collapsed archs only)
export const scenarioMeanF1 = [
  { scenario: 'Scenario I\n(100% Real)',    mean: ((0.9425+0.9466+0.9464+0.9323)/4*100).toFixed(2), label: '100% Real' },
  { scenario: 'Scenario II\n(75%R / 25%S)', mean: ((0.9245+0.9431+0.9335+0.9247)/4*100).toFixed(2), label: '75% Real / 25% Synthetic' },
  { scenario: 'Scenario III\n(50%R / 50%S)',mean: ((0.9150+0.9320+0.9105+0.9202)/4*100).toFixed(2), label: '50% Real / 50% Synthetic' },
  { scenario: 'Scenario IV\n(25%R / 75%S)', mean: ((0.9008+0.8958+0.9115+0.8980)/4*100).toFixed(2), label: '25% Real / 75% Synthetic' },
]

// ─── Dataset Statistics ───────────────────────────────────────────────────────
export const datasetStats = {
  total: 19195,
  gramPositive: 6054,
  gramNegative: 13141,
  trainTotal: 13437,
  valTotal: 2879,
  testTotal: 2879,
  sources: [
    { name: 'PLA General Hospital', type: 'Lower Respiratory Tract', gp: 2654, gn: 9170, total: 11824 },
    { name: 'Yi et al.', type: 'Blood Culture', gp: 3400, gn: 3971, total: 7371 },
  ],
}

// ─── Training Hyperparameters ─────────────────────────────────────────────────
export const ganHyperparams = [
  { param: 'Input Resolution', value: '256 × 256 px' },
  { param: 'Latent Dimension', value: '512' },
  { param: 'Batch Size', value: '32' },
  { param: 'Optimizer', value: 'Adam (β₁=0, β₂=0.99)' },
  { param: 'Augmentation Mode', value: 'ADA (bgc pipeline)' },
  { param: 'ADA Target Probability', value: '0.6' },
  { param: 'Training Duration (GN)', value: '1,000 ticks' },
  { param: 'Training Duration (GP)', value: '1,000 ticks' },
  { param: 'FID Evaluation', value: 'fid50k_full (every 50 ticks)' },
]

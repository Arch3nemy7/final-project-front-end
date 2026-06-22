// Faithful port of the design's hand-built f1Chart() grouped-bar SVG renderer.
// Collapsed cells (F1 < 0.5) render dimmed with a "‡" marker.
import { F1_ARCHS } from '../../store/data.js'

// Renders the real macro-F1 table from backend results. Returns null when there
// is no data yet (the caller shows an empty state).
export default function F1Chart({ rows, archs: archsProp }) {
  const w = 660, h = 300, pl = 38, pr = 14, pt = 14, pb = 66
  const archs = archsProp && archsProp.length ? archsProp : F1_ARCHS
  const data = rows && rows.length ? rows : null
  if (!data) return null
  const colors = ['#1f3a8a', '#2f6bd8', '#7aa6e6', '#bcd3f2']
  const mono = 'IBM Plex Mono, monospace'
  const plotH = h - pt - pb
  const sy = (v) => pt + (1 - v) * plotH
  const els = []

  for (let i = 0; i <= 5; i++) {
    const v = i / 5, y = sy(v)
    els.push(<line key={'g' + i} x1={pl} y1={y} x2={w - pr} y2={y} stroke="#eef1f6" />)
    els.push(
      <text key={'yl' + i} x={pl - 6} y={y + 3} textAnchor="end" fontSize={10} fontFamily={mono} fill="#8a94a4">
        {v.toFixed(1)}
      </text>,
    )
  }

  const plotW = w - pl - pr, groupW = plotW / archs.length
  const innerPad = 12, barGap = 5, bw = (groupW - innerPad * 2 - barGap * 3) / 4

  archs.forEach((a, gi) => {
    const gx = pl + gi * groupW + innerPad
    data[gi].forEach((val, bi) => {
      const x = gx + bi * (bw + barGap), y = sy(val), bh = sy(0) - y, col = val < 0.5
      els.push(<rect key={'r' + gi + bi} x={x} y={y} width={bw} height={bh} fill={colors[bi]} rx={2} opacity={col ? 0.5 : 1} />)
      if (col) {
        els.push(
          <text key={'c' + gi + bi} x={x + bw / 2} y={y - 3} textAnchor="middle" fontSize={10} fill="#cc4040" fontFamily={mono}>
            ‡
          </text>,
        )
      }
    })
    els.push(
      <text key={'ax' + gi} x={gx + (groupW - innerPad * 2) / 2} y={h - pb + 18} textAnchor="middle" fontSize={10} fontFamily="IBM Plex Sans, sans-serif" fill="#5b6677">
        {a}
      </text>,
    )
  })

  ;['I · 100/0', 'II · 75/25', 'III · 50/50', 'IV · 25/75'].forEach((L, i) => {
    const lx = pl + i * 155, ly = h - 20
    els.push(<rect key={'lg' + i} x={lx} y={ly - 9} width={11} height={11} fill={colors[i]} rx={2} />)
    els.push(
      <text key={'lt' + i} x={lx + 16} y={ly + 1} fontSize={10} fontFamily={mono} fill="#5b6677">
        {L}
      </text>,
    )
  })

  return (
    <svg viewBox={'0 0 ' + w + ' ' + h} width="100%" height="auto" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      {els}
    </svg>
  )
}

// Faithful port of the design's hand-built lineChart() SVG renderer.
// Props: w, h, xMax, yMax, yMin, xTicks, yLabel, yFmt, series:[{points,color}],
// benchmarks:[{y,color,label}].
export default function LineChart({
  w = 600, h = 230, xMax, yMax, yMin = 0, xTicks,
  yLabel, yFmt, series = [], benchmarks = [],
}) {
  const pl = 46, pr = 18, pt = 16, pb = 28
  // Auto-derive x-axis ticks from xMax when not provided (so kimg axes scale).
  if (!xTicks) xTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(xMax * f))
  const sx = (x) => pl + (x / xMax) * (w - pl - pr)
  const sy = (v) => pt + (1 - ((Math.min(v, yMax) - yMin) / (yMax - yMin))) * (h - pt - pb)

  const mono = 'IBM Plex Mono, monospace'
  const els = []

  for (let i = 0; i <= 4; i++) {
    const v = yMin + (yMax - yMin) * i / 4, y = sy(v)
    els.push(<line key={'g' + i} x1={pl} y1={y} x2={w - pr} y2={y} stroke="#eef1f6" />)
    els.push(
      <text key={'yl' + i} x={pl - 8} y={y + 3} textAnchor="end" fontSize={10} fontFamily={mono} fill="#8a94a4">
        {yFmt ? yFmt(v) : v}
      </text>,
    )
  }

  xTicks.forEach((xt, i) => {
    els.push(
      <text key={'xl' + i} x={sx(xt)} y={h - 8} textAnchor="middle" fontSize={10} fontFamily={mono} fill="#8a94a4">
        {xt}
      </text>,
    )
  })

  benchmarks.forEach((b, i) => {
    const y = sy(b.y)
    els.push(<line key={'b' + i} x1={pl} y1={y} x2={w - pr} y2={y} stroke={b.color} strokeWidth={1} strokeDasharray="5 4" opacity={0.6} />)
    els.push(
      <text key={'bt' + i} x={w - pr} y={y - 4} textAnchor="end" fontSize={9} fontFamily={mono} fill={b.color}>
        {b.label}
      </text>,
    )
  })

  series.forEach((s, i) => {
    if (!s.points || !s.points.length) return
    const pts = s.points.map((p) => sx(p.x).toFixed(1) + ',' + sy(p.y).toFixed(1)).join(' ')
    els.push(<polyline key={'s' + i} points={pts} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />)
    const last = s.points[s.points.length - 1]
    els.push(<circle key={'d' + i} cx={sx(last.x)} cy={sy(last.y)} r={3.5} fill={s.color} stroke="#fff" strokeWidth={1.5} />)
  })

  if (yLabel) {
    els.push(<text key="yt" x={10} y={pt - 3} fontSize={9} fontFamily={mono} fill="#8a94a4">{yLabel}</text>)
  }

  return (
    <svg viewBox={'0 0 ' + w + ' ' + h} width="100%" height="auto" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      {els}
    </svg>
  )
}

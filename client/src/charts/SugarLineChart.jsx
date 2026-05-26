import React from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea } from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const color = d.sugar_level > 140 ? '#EF4444' : d.sugar_level < 80 ? '#F59E0B' : '#10B981'
  return (
    <div className="bg-white p-3 rounded-xl shadow-elevated border border-surface-border">
      <p className="text-sm font-semibold text-text-heading">{label}</p>
      <p className="text-sm">Level: <span className="font-bold" style={{ color }}>{d.sugar_level} mg/dL</span></p>
      <p className="text-xs text-text-muted">{d.meal_type} · {d.timing}</p>
    </div>
  )
}

function CustomDot(props) {
  const { cx, cy, payload } = props
  if (!cx || !cy) return null
  const color = payload.sugar_level > 140 ? '#EF4444' : payload.sugar_level < 80 ? '#F59E0B' : '#10B981'
  return <circle cx={cx} cy={cy} r={4} fill={color} stroke="#fff" strokeWidth={2} />
}

export default function SugarLineChart({ data = [] }) {
  const chartData = data.map(d => ({
    ...d,
    date: new Date(d.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    time: new Date(d.recorded_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }))

  if (chartData.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-text-muted text-sm">
        No data to display
      </div>
    )
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} domain={['dataMin - 20', 'dataMax + 20']} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceArea y1={80} y2={140} fill="#dcfce7" fillOpacity={0.3} />
          <ReferenceArea y1={140} y2={250} fill="#fee2e2" fillOpacity={0.2} />
          <ReferenceArea y1={0} y2={80} fill="#fef3c7" fillOpacity={0.2} />
          <Line type="monotone" dataKey="sugar_level" stroke="#94a3b8" strokeWidth={2.5} dot={<CustomDot />} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

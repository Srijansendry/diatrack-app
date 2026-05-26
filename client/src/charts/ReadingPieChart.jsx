import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const COLORS = { Normal: '#10B981', High: '#EF4444', Low: '#F59E0B' }

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white p-3 rounded-xl shadow-elevated border border-surface-border">
      <p className="text-sm font-semibold" style={{ color: payload[0].payload.fill }}>{payload[0].name}</p>
      <p className="text-sm text-text-body">{payload[0].value} readings</p>
    </div>
  )
}

export default function ReadingPieChart({ data = [] }) {
  const grouped = data.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1
    return acc
  }, {})

  const pieData = Object.entries(grouped).map(([name, value]) => ({
    name, value, fill: COLORS[name] || '#94a3b8'
  }))

  if (pieData.length === 0) {
    return <div className="h-72 flex items-center justify-center text-text-muted text-sm">No data to display</div>
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
            {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', color: '#64748b' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

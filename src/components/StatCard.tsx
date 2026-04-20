import './components.css'

interface StatCardProps {
  value: string
  label: string
  valueColor?: string
}

export function StatCard({ value, label, valueColor }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-value" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </div>
      <div className="stat-card-label">{label}</div>
    </div>
  )
}

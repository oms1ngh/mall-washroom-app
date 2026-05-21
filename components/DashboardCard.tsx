type Props = {
  title: string
  value: string | number
  color: string
}

export default function DashboardCard({ title, value, color }: Props) {
  return (
    <div
      className={`rounded-2xl shadow-lg p-6 text-white ${color} hover:scale-105 transition`}
    >
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-4xl font-bold mt-3">{value}</p>
    </div>
  )
}
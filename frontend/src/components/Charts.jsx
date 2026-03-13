import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts"

export default function Charts({ data }) {
  return (
    <div className="w-full h-80 glass-card p-6">
      <h3 className="text-xl font-bold mb-4">Consumo por Dia</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="DIA" stroke="#888" fontSize={12} tickFormatter={(val) => val.split('-').pop()} />
          <YAxis stroke="#888" fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: '8px' }}
            itemStyle={{ color: '#D2B48C' }}
          />
          <Bar dataKey="TOTAL" fill="#6F4E37" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

type Column = {
  key: string
  label: string
}

type Props = {
  columns: Column[]
  data: any[]
}

export default function DataTable({ columns, data }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-800 text-white">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-4 text-left">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-b hover:bg-pink-50 transition"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-4">
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
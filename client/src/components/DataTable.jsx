import { useState, useMemo } from 'react';

export default function DataTable({ columns, data, emptyMessage = 'No data available' }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortCol === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(key);
      setSortDir('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortCol) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortCol];
      const bVal = b[sortCol];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortCol, sortDir]);

  if (sortedData.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-surface-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead className="bg-surface-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left py-3 px-4 font-medium text-surface-700 whitespace-nowrap ${
                    col.sortable ? 'cursor-pointer hover:bg-surface-100 select-none' : ''
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <span className="text-surface-400">
                        {sortCol === col.key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <tr key={idx} className="border-t border-surface-100 hover:bg-surface-50">
                {columns.map((col) => (
                  <td key={col.key} className="py-2.5 px-4 text-surface-600 whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : (
                      row[col.key] !== null && row[col.key] !== undefined
                        ? String(row[col.key])
                        : <span className="text-surface-400 italic">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

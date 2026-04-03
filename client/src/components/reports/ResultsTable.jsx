export default function ResultsTable({ metaData, rows, rowCount }) {
  if (rows.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-surface-500">No data returned</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead className="bg-surface-50 dark:bg-surface-900">
            <tr>
              {metaData.map((col) => (
                <th key={col.name} className="text-left py-2.5 px-3 font-medium text-surface-700 dark:text-surface-300 whitespace-nowrap">
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-t border-surface-100 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700/50">
                {metaData.map((col) => (
                  <td key={col.name} className="py-2 px-3 text-surface-600 dark:text-surface-400 whitespace-nowrap">
                    {row[col.name] !== null && row[col.name] !== undefined
                      ? String(row[col.name])
                      : <span className="text-surface-400 dark:text-surface-500 italic">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rowCount > 100 && (
        <p className="text-xs text-surface-400 dark:text-surface-500 mt-2 px-4 pb-3">
          Showing first 100 of {rowCount} rows. Export for full results.
        </p>
      )}
    </div>
  );
}

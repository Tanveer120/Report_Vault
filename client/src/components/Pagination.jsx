export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        className="btn-secondary"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>

      {start > 1 && (
        <>
          <button className="btn-secondary" onClick={() => onPageChange(1)}>1</button>
          {start > 2 && <span className="px-2 text-surface-400">...</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            p === page
              ? 'bg-primary-600 text-white'
              : 'text-surface-600 hover:bg-surface-100'
          }`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2 text-surface-400">...</span>}
          <button className="btn-secondary" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}

      <button
        className="btn-secondary"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}

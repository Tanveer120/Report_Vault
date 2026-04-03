import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/apiClient';

export default function ExecutionHistory({ reportId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/reports/${reportId}/logs`, {
        params: { page, pageSize: 20 },
      });
      setLogs(data.data.logs);
      setPagination(data.data.pagination);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [reportId, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin-slow h-6 w-6 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-surface-500">No execution history</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
      <div className="divide-y divide-surface-100 dark:divide-surface-700">
        {logs.map((log) => (
          <div key={log.id} className="flex items-center gap-4 px-4 py-3">
            <span className={`badge flex-shrink-0 ${log.status === 'success' ? 'badge-success' : 'badge-error'}`}>
              {log.status}
            </span>
            <span className="text-sm text-surface-600 dark:text-surface-400 flex-shrink-0 w-20">{log.row_count} rows</span>
            <span className="text-sm text-surface-400 dark:text-surface-500 flex-shrink-0 w-20">{log.execution_time_ms}ms</span>
            <span className="text-sm text-surface-500 dark:text-surface-400 flex-1 truncate">{log.username}</span>
            <span className="text-xs text-surface-400 flex-shrink-0">
              {new Date(log.executed_at).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-surface-100 dark:border-surface-700">
          <button
            className="btn-secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="text-sm text-surface-500">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            className="btn-secondary"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

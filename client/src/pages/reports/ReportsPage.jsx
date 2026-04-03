import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import ReportCard from '../../components/reports/ReportCard';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/reports', {
        params: { search, page, pageSize: 20 },
      });
      setReports(data.data.reports);
      setPagination(data.data.pagination);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(() => fetchReports(), 300);
    return () => clearTimeout(timer);
  }, [fetchReports]);

  if (loading && reports.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin-slow h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">Reports</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            className="input"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-surface-500">No reports found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
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

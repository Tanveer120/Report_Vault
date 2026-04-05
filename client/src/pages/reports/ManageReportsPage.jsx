import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { SkeletonTable } from '../../components/Skeleton';
import toast from 'react-hot-toast';

export default function ManageReportsPage() {
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

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await apiClient.delete(`/reports/${id}`);
      toast.success('Report deleted');
      fetchReports();
    } catch {
      toast.error('Failed to delete report');
    }
  };

  if (loading && reports.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
          <div className="h-10 w-32 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
        </div>
        <div className="h-10 w-64 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
        <SkeletonTable />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">Manage Reports</h1>
        <Link to="/admin/reports/new" className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Report
        </Link>
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
          <p className="text-surface-500 mb-4">No reports found</p>
          <Link to="/admin/reports/new" className="btn-primary">
            Create your first report
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 dark:bg-surface-900">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-surface-700 dark:text-surface-300">Name</th>
                <th className="text-left py-3 px-4 font-medium text-surface-700 dark:text-surface-300 hidden md:table-cell">Created By</th>
                <th className="text-left py-3 px-4 font-medium text-surface-700 dark:text-surface-300 hidden lg:table-cell">Updated</th>
                <th className="text-right py-3 px-4 font-medium text-surface-700 dark:text-surface-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-t border-surface-100 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700/50">
                  <td className="py-3 px-4">
                    <span className="font-medium text-surface-900 dark:text-surface-100">{report.name}</span>
                  </td>
                  <td className="py-3 px-4 text-surface-500 dark:text-surface-400 hidden md:table-cell">{report.created_by_username}</td>
                  <td className="py-3 px-4 text-surface-400 dark:text-surface-500 hidden lg:table-cell">
                    {new Date(report.updated_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/reports/${report.id}/edit`} className="text-sm text-primary-600 hover:text-primary-700">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(report.id, report.name)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span className="text-sm text-surface-500">Page {page} of {pagination.totalPages}</span>
          <button className="btn-secondary" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import SqlEditor from '../../components/reports/SqlEditor';
import ParamEditor from '../../components/reports/ParamEditor';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import { SkeletonForm } from '../../components/Skeleton';
import toast from 'react-hot-toast';

export default function ReportEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');
  const [params, setParams] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  const fetchReport = useCallback(async () => {
    try {
      const { data } = await apiClient.get(`/reports/${id}`);
      setName(data.data.name);
      setDescription(data.data.description || '');
      setSqlQuery(data.data.sql_query || '');
      setParams(data.data.params || []);
    } catch {
      toast.error('Failed to load report');
      navigate('/admin/reports');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (isEdit) fetchReport();
  }, [isEdit, fetchReport]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Report name is required'); return; }
    if (!sqlQuery.trim()) { toast.error('SQL query is required'); return; }

    setSaving(true);
    try {
      const payload = { name, description, sql_query: sqlQuery, params };
      if (isEdit) {
        await apiClient.put(`/reports/${id}`, payload);
        toast.success('Report updated');
      } else {
        await apiClient.post('/reports', payload);
        toast.success('Report created');
      }
      navigate('/admin/reports');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SkeletonForm />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
          {isEdit ? 'Edit Report' : 'New Report'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <Input
            label="Report Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">SQL Query *</label>
            <SqlEditor
              value={sqlQuery}
              onChange={setSqlQuery}
              params={params}
            />
          </div>
        </div>

        <div className="card">
          <ParamEditor params={params} onChange={setParams} />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Report' : 'Create Report'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/reports')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

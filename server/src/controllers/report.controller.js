const {
  listReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  getParamsByReportId,
} = require('../services/report.service');
const asyncHandler = require('../utils/async-handler');

const list = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 20));
  const search = req.query.search || '';
  const result = await listReports({ page, pageSize, search });

  res.json({ success: true, data: result });
});

const getById = asyncHandler(async (req, res) => {
  const reportId = parseInt(req.params.id, 10);
  if (isNaN(reportId)) {
    return res.status(400).json({ success: false, error: { message: 'Invalid report ID' } });
  }

  const isAdmin = req.user.role === 'admin';
  const report = await getReportById(reportId, { isAdmin });

  if (!report) {
    return res.status(404).json({ success: false, error: { message: 'Report not found' } });
  }

  const params = await getParamsByReportId(reportId);
  res.json({ success: true, data: { ...report, params } });
});

const create = asyncHandler(async (req, res) => {
  const { name, description, sql_query, params } = req.body;

  const report = await createReport({
    name,
    description,
    sql_query,
    created_by: req.user.id,
    params: params || [],
  });

  res.status(201).json({ success: true, data: report });
});

const update = asyncHandler(async (req, res) => {
  const reportId = parseInt(req.params.id, 10);
  if (isNaN(reportId)) {
    return res.status(400).json({ success: false, error: { message: 'Invalid report ID' } });
  }

  const { name, description, sql_query, params } = req.body;

  const report = await updateReport(reportId, {
    name,
    description,
    sql_query,
    params,
  });

  res.json({ success: true, data: report });
});

const remove = asyncHandler(async (req, res) => {
  const reportId = parseInt(req.params.id, 10);
  if (isNaN(reportId)) {
    return res.status(400).json({ success: false, error: { message: 'Invalid report ID' } });
  }

  await deleteReport(reportId);
  res.json({ success: true, message: 'Report deleted successfully' });
});

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};

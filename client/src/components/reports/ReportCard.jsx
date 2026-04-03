import { Link } from 'react-router-dom';

export default function ReportCard({ report }) {
  return (
    <Link
      to={`/reports/${report.id}`}
      className="card hover:shadow-md transition-shadow block"
    >
      <h3 className="font-medium text-surface-900 dark:text-surface-100 mb-1">{report.name}</h3>
      {report.description && (
        <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-2 mb-2">{report.description}</p>
      )}
      <p className="text-xs text-surface-400 dark:text-surface-500">
        By {report.created_by_username}
      </p>
    </Link>
  );
}

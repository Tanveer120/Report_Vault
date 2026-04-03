export default function EmptyState({ title, description, action, icon }) {
  return (
    <div className="card text-center py-12">
      {icon && (
        <div className="mx-auto w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      {title && <h3 className="text-lg font-medium text-surface-900 mb-1">{title}</h3>}
      {description && <p className="text-surface-500 mb-4">{description}</p>}
      {action}
    </div>
  );
}

import { forwardRef } from 'react';

const Textarea = forwardRef(({ label, error, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-surface-700 mb-1">
        {label}
      </label>
    )}
    <textarea
      ref={ref}
      className={`textarea ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''} ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));

Textarea.displayName = 'Textarea';

export default Textarea;

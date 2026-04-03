import { forwardRef } from 'react';

const Select = forwardRef(({ label, error, children, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-surface-700 mb-1">
        {label}
      </label>
    )}
    <select
      ref={ref}
      className={`select ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''} ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));

Select.displayName = 'Select';

export default Select;

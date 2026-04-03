import { forwardRef, useState } from 'react';

const DatePicker = forwardRef(({ label, error, className = '', ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = props.value || props.defaultValue;

  return (
    <div className="w-full relative">
      {label && (
        <label className="block text-sm font-medium text-surface-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          type="date"
          className={`input pr-10 ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''} ${className}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        <svg
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${
            isFocused || hasValue ? 'text-primary-500' : 'text-surface-400'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;

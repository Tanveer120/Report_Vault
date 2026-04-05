import { forwardRef, useRef, useCallback } from 'react';

const Input = forwardRef(({ label, error, className = '', autoResize = false, ...props }, ref) => {
  const internalRef = useRef(null);
  const resolvedRef = ref || internalRef;

  const handleInput = useCallback((e) => {
    if (!autoResize) {
      props.onChange?.(e);
      return;
    }
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    props.onChange?.(e);
  }, [autoResize, props.onChange]);

  if (autoResize) {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-surface-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={resolvedRef}
          className={`input resize-none overflow-y-auto scrollbar-thin ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''} ${className}`}
          style={{ minHeight: '42px', maxHeight: '120px' }}
          onInput={handleInput}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-surface-700 mb-1">
          {label}
        </label>
      )}
      <input
        ref={resolvedRef}
        className={`input ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

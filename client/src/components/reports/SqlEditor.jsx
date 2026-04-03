import { useState, useCallback } from 'react';

export default function SqlEditor({ value, onChange, params = [], error }) {
  const [isFocused, setIsFocused] = useState(false);

const paramNames = params.map((p) => p.param_name).filter(Boolean);

  const handleInput = useCallback((e) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className="relative">
      <div
        className={`relative border rounded-lg overflow-hidden transition-colors ${
          error
            ? 'border-red-500'
            : isFocused
              ? 'border-primary-500 ring-2 ring-primary-500/20'
              : 'border-surface-300 dark:border-surface-600'
        }`}
      >
        <textarea
          className="w-full h-48 p-3 font-mono text-sm bg-transparent text-surface-900 dark:text-surface-100 resize-y outline-none placeholder-surface-400 dark:placeholder-surface-500"
          value={value}
          onChange={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="SELECT * FROM ..."
          spellCheck={false}
        />
      </div>
      {paramNames.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {paramNames.map((name) => (
            <span key={name} className="badge bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs">
              :{name}
            </span>
          ))}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

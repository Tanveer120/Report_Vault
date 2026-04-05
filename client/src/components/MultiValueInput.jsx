import { useState, useCallback, useRef, useEffect } from 'react';

export default function MultiValueInput({ label, value = [], onChange, error, placeholder = 'Enter values, one per line' }) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const textareaRef = useRef(null);

  const addTag = useCallback((rawValue) => {
    const trimmed = rawValue.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) return;
    onChange([...value, trimmed]);
  }, [value, onChange]);

  const removeTag = useCallback((index) => {
    onChange(value.filter((_, i) => i !== index));
  }, [value, onChange]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const items = pasted.split(/[,\n\r\t]+/).map((s) => s.trim()).filter(Boolean);
    const newTags = items.filter((item) => !value.includes(item));
    if (newTags.length > 0) {
      onChange([...value, ...newTags]);
    }
    setIsPasting(true);
  };

  useEffect(() => {
    if (isPasting) {
      const timer = setTimeout(() => setIsPasting(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isPasting]);

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
      setInputValue('');
    }
    setIsFocused(false);
  };

  const handleClearAll = () => {
    onChange([]);
    setInputValue('');
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-surface-700">
            {label}
          </label>
          {value.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-surface-400 hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      )}
      <div
        className={`min-h-[42px] max-h-[120px] overflow-y-auto border rounded-lg px-3 py-1.5 flex flex-wrap content-start items-start gap-1.5 bg-white dark:bg-surface-800 transition-colors cursor-text ${
          error
            ? 'border-red-500'
            : isFocused
              ? 'border-primary-500 ring-2 ring-primary-500/20'
              : 'border-surface-300 dark:border-surface-600'
        }`}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#3b82f6 transparent',
        }}
        onClick={() => textareaRef.current?.focus()}
      >
        {value.map((tag, idx) => (
          <span
            key={`${tag}-${idx}`}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm rounded-md font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(idx); }}
              className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-100 transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={textareaRef}
          type="text"
          className="flex-1 min-w-[120px] outline-none text-sm bg-transparent placeholder-surface-400 dark:placeholder-surface-500 dark:text-surface-100"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder={value.length === 0 ? placeholder : ''}
        />
      </div>
      {value.length > 0 && (
        <p className="mt-1 text-xs text-surface-400">{value.length} value{value.length !== 1 ? 's' : ''}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

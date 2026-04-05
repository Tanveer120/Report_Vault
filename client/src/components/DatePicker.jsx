import { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CalendarIcon = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-surface-400 hover:text-primary-500 transition-colors"
    tabIndex={-1}
  >
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </button>
);

function formatDateInput(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  let formatted = '';
  if (digits.length > 0) formatted = digits.slice(0, 2);
  if (digits.length > 2) formatted += '/' + digits.slice(2, 4);
  if (digits.length > 4) formatted += '/' + digits.slice(4, 8);
  return formatted;
}

function parseDateInput(value) {
  const parts = value.split('/');
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts;
  if (dd.length !== 2 || mm.length !== 2 || yyyy.length !== 4) return null;
  const d = parseInt(dd, 10);
  const m = parseInt(mm, 10) - 1;
  const y = parseInt(yyyy, 10);
  const date = new Date(y, m, d);
  if (date.getFullYear() !== y || date.getMonth() !== m || date.getDate() !== d) return null;
  return date;
}

function toLocalDateString(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function parseLocalDate(value) {
  if (!value) return null;
  const [yyyy, mm, dd] = value.split('-').map(Number);
  return new Date(yyyy, mm - 1, dd);
}

const DatePicker = forwardRef(({ label, error, className = '', value, onChange, placeholder, ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const resolvedRef = ref || inputRef;
  const dateValue = value ? parseLocalDate(value) : null;

  useEffect(() => {
    if (value) {
      const d = parseLocalDate(value);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      setInputValue(`${dd}/${mm}/${yyyy}`);
    } else {
      setInputValue('');
    }
  }, [value]);

  const handleInputChange = useCallback((e) => {
    const raw = e.target.value;
    const formatted = formatDateInput(raw);
    setInputValue(formatted);
    const parsed = parseDateInput(formatted);
    if (onChange) {
      onChange({ target: { value: parsed ? toLocalDateString(parsed) : '' } });
    }
  }, [onChange]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Backspace' && inputValue.length <= 3) {
      setInputValue('');
      if (onChange) onChange({ target: { value: '' } });
    }
  }, [inputValue, onChange]);

  const handlePickerChange = useCallback((date) => {
    if (date) {
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      setInputValue(`${dd}/${mm}/${yyyy}`);
      if (onChange) onChange({ target: { value: toLocalDateString(date) } });
    }
    setIsOpen(false);
  }, [onChange]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full" ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-surface-700 mb-1">{label}</label>
      )}
      <div className="relative">
        <input
          ref={resolvedRef}
          type="text"
          inputMode="numeric"
          className={`input pr-10 font-mono tracking-wider ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''} ${isFocused ? 'border-primary-500 ring-2 ring-primary-500/20' : ''} ${className}`}
          placeholder="dd/mm/yyyy"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={10}
        />
        <CalendarIcon onClick={() => setIsOpen(!isOpen)} />
        <div className={`${isOpen ? 'block' : 'hidden'} absolute z-50 mt-1 left-0`}>
          <ReactDatePicker
            selected={dateValue || new Date()}
            onChange={handlePickerChange}
            dateFormat="dd/MM/yyyy"
            showPopperArrow={false}
            inline
            calendarClassName="rr-datepicker"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            scrollableYearDropdown
            {...props}
          />
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;

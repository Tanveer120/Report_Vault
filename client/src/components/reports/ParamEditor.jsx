import { useCallback } from 'react';
import Select from '../Select';
import Input from '../Input';

const PARAM_TYPES = ['text', 'number', 'date', 'multi_value', 'select'];

function ParamRow({ param, index, onChange, onRemove, onMoveUp, onMoveDown, canRemove, isFirst, isLast }) {
  return (
    <div className="grid grid-cols-12 gap-2 items-start py-3 border-t border-surface-100 dark:border-surface-700">
      <div className="col-span-1 flex flex-col items-center gap-1 pt-2">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => onMoveUp(index)}
          className="p-0.5 rounded hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 dark:text-surface-500 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move up"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={() => onMoveDown(index)}
          className="p-0.5 rounded hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 dark:text-surface-500 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move down"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className="col-span-2">
        <Input
          placeholder="Name"
          value={param.param_name}
          onChange={(e) => onChange(index, 'param_name', e.target.value)}
        />
      </div>
      <div className="col-span-2">
        <Input
          placeholder="Label"
          value={param.param_label}
          onChange={(e) => onChange(index, 'param_label', e.target.value)}
        />
      </div>
      <div className="col-span-2">
        <Select
          value={param.param_type}
          onChange={(e) => onChange(index, 'param_type', e.target.value)}
        >
          {PARAM_TYPES.map((t) => (
            <option key={t} value={t}>{t.replace('_', ' ')}</option>
          ))}
        </Select>
      </div>
      <div className="col-span-2">
        <Input
          placeholder="Placeholder"
          value={param.placeholder || ''}
          onChange={(e) => onChange(index, 'placeholder', e.target.value)}
        />
      </div>
      <div className="col-span-2 flex items-center gap-2 pt-2">
        <label className="flex items-center gap-1 text-sm text-surface-600">
          <input
            type="checkbox"
            checked={param.is_required === 1}
            onChange={(e) => onChange(index, 'is_required', e.target.checked ? 1 : 0)}
          />
          Required
        </label>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="ml-auto p-1 rounded hover:bg-red-50 text-red-500 hover:text-red-700"
            title="Remove"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default function ParamEditor({ params, onChange }) {
  const handleParamChange = useCallback((index, field, value) => {
    onChange((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, [onChange]);

  const handleRemove = useCallback((index) => {
    onChange((prev) => prev.filter((_, i) => i !== index));
  }, [onChange]);

  const handleMoveUp = useCallback((index) => {
    if (index <= 0) return;
    onChange((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next.map((p, i) => ({ ...p, sort_order: i }));
    });
  }, [onChange]);

  const handleMoveDown = useCallback((index) => {
    onChange((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next.map((p, i) => ({ ...p, sort_order: i }));
    });
  }, [onChange]);

  const handleAdd = useCallback(() => {
    onChange((prev) => [...prev, {
      param_name: '',
      param_label: '',
      param_type: 'text',
      placeholder: '',
      is_required: 1,
      sort_order: prev.length,
    }]);
  }, [onChange]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-surface-700">Parameters</h3>
        <button type="button" className="btn-secondary text-xs" onClick={handleAdd}>
          Add Parameter
        </button>
      </div>

      {params.length > 0 && (
        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-surface-500 px-1 mb-1">
          <div className="col-span-1"></div>
          <div className="col-span-2">Name</div>
          <div className="col-span-2">Label</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Placeholder</div>
          <div className="col-span-2"></div>
        </div>
      )}

      {params.map((param, index) => (
        <ParamRow
          key={`param-${index}-${param.param_name}`}
          param={param}
          index={index}
          onChange={handleParamChange}
          onRemove={handleRemove}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          canRemove={true}
          isFirst={index === 0}
          isLast={index === params.length - 1}
        />
      ))}

      {params.length === 0 && (
        <p className="text-sm text-surface-400 text-center py-6">No parameters defined</p>
      )}
    </div>
  );
}

import { useCallback } from 'react';
import Input from '../Input';
import Select from '../Select';
import DatePicker from '../DatePicker';
import MultiValueInput from '../MultiValueInput';

function ParamField({ param, value, onChange }) {
  switch (param.param_type) {
    case 'multi_value':
      return (
        <div className="md:col-span-2 lg:col-span-3">
          <MultiValueInput
            label={param.param_label}
            value={value || []}
            onChange={(vals) => onChange(param.param_name, vals)}
            placeholder={param.placeholder || 'Enter values, one per line'}
          />
        </div>
      );

    case 'select': {
      let options = [];
      try {
        if (param.options_json) {
          options = JSON.parse(param.options_json);
        }
      } catch {
        // ignore parse errors
      }
      return (
        <Select
          label={param.param_label}
          value={value || ''}
          onChange={(e) => onChange(param.param_name, e.target.value)}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      );
    }

    case 'date':
      return (
        <DatePicker
          label={param.param_label}
          value={value || ''}
          onChange={(e) => onChange(param.param_name, e.target.value)}
          placeholder={param.placeholder}
        />
      );

    case 'number':
      return (
        <Input
          label={param.param_label}
          type="number"
          value={value ?? ''}
          onChange={(e) =>
            onChange(param.param_name, e.target.value === '' ? '' : Number(e.target.value))
          }
          placeholder={param.placeholder}
        />
      );

    default:
      return (
        <Input
          label={param.param_label}
          type="text"
          value={value || ''}
          onChange={(e) => onChange(param.param_name, e.target.value)}
          placeholder={param.placeholder}
          autoResize
        />
      );
  }
}

export default function DynamicParamForm({ params, values, onChange, onSubmit, submitLabel = 'Run Report', running = false }) {
  const handleChange = useCallback((name, value) => {
    onChange(name, value);
  }, [onChange]);

  const sortedParams = [...params].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedParams.map((param) => (
          <ParamField
            key={param.param_name}
            param={param}
            value={values[param.param_name]}
            onChange={handleChange}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 mt-6">
        <button type="submit" className="btn-primary" disabled={running}>
          {running ? (
            <>
              <div className="animate-spin-slow h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Running...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}

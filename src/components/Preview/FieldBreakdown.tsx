export interface FieldConfig<T = unknown> {
  name: string;
  label: string;
  required: boolean;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'cyan' | 'indigo' | 'yellow' | 'pink' | 'red';
  getValue: (data: T) => string;
}

interface FieldBreakdownProps<T = unknown> {
  title?: string;
  fields: FieldConfig<T>[];
  data: T;
}

const colorClasses = {
  blue: 'border-blue-500',
  green: 'border-green-500',
  purple: 'border-purple-500',
  orange: 'border-orange-500',
  cyan: 'border-cyan-500',
  indigo: 'border-indigo-500',
  yellow: 'border-yellow-500',
  pink: 'border-pink-500',
  red: 'border-red-500'
};

export function FieldBreakdown<T = unknown>({
  title = 'Field Breakdown',
  fields,
  data
}: FieldBreakdownProps<T>) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className={`border-l-4 ${colorClasses[field.color]} pl-4`}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium text-gray-900">{field.label}</h3>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  field.required ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {field.required ? 'Required' : 'Optional'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{field.description}</p>
            <div className="text-xs text-gray-500">Current value: {field.getValue(data)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

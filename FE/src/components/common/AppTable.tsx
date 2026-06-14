import React from 'react';

interface Column<T> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface AppTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: string;
  className?: string;
}

export const AppTable = React.forwardRef<HTMLTableElement, AppTableProps<any>>(
  ({ columns, data, keyField, className = '' }, ref) => {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <table ref={ref} className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100 border-b">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row: any) => (
              <tr key={row[keyField]} className="border-b hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={`${row[keyField]}-${col.key}`} className="px-4 py-2 text-sm text-gray-700">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);

AppTable.displayName = 'AppTable';

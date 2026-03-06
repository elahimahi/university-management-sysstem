import React from 'react';

const DataTable = ({ columns, data, rowKey = 'id' }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full border border-gray-200">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} className="px-4 py-2 text-left bg-gray-50 font-semibold text-sm text-gray-700">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="text-center py-4 text-gray-400">No data</td>
          </tr>
        ) : (
          data.map((row) => (
            <tr key={row[rowKey]} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-2 border-t border-gray-100">
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default DataTable;

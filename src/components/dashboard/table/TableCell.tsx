import React, { useState, useEffect } from 'react';
import { Column, Row } from '../../../types/table-types';
import { useTableContext } from './TableContext';

interface TableCellProps {
  column: Column;
  row: Row;
}

export function TableCell({ column, row }: TableCellProps) {
  const { updateCell } = useTableContext();
  const cellData = row.cells[column.id] || { value: '' };
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(cellData.value);

  // Sync state if cellData changes from outside (e.g. dragging or other updates)
  useEffect(() => {
    setValue(cellData.value);
  }, [cellData.value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (value !== cellData.value) {
      updateCell(row.id, column.id, value);
    }
  };

  const renderContent = () => {
    // Checkboxes should be immediately interactive
    if (column.type === 'checkbox') {
      return (
        <div className="w-full h-full min-h-[32px] flex items-center justify-center">
          <input
            type="checkbox"
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
            checked={!!value}
            onChange={(e) => {
              setValue(e.target.checked);
              updateCell(row.id, column.id, e.target.checked);
            }}
          />
        </div>
      );
    }

    if (isEditing) {
      switch (column.type) {
        case 'status':
          return (
            <select
              autoFocus
              className="w-full h-full min-h-[32px] px-2 text-sm bg-white border border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                updateCell(row.id, column.id, e.target.value);
                setIsEditing(false);
              }}
              onBlur={handleBlur}
            >
              <option value="">Select...</option>
              {column.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          );
        case 'date':
          return (
            <input
              type="date"
              autoFocus
              className="w-full h-full min-h-[32px] px-2 text-sm bg-white border border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
              value={value ? new Date(value).toISOString().split('T')[0] : ''}
              onChange={(e) => {
                setValue(e.target.value);
                updateCell(row.id, column.id, e.target.value);
                setIsEditing(false);
              }}
              onBlur={handleBlur}
            />
          );
        case 'number':
          return (
            <input
              type="number"
              autoFocus
              className="w-full h-full min-h-[32px] px-2 text-sm bg-white border border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={handleBlur}
            />
          );
        case 'text':
        default:
          return (
            <input
              type="text"
              autoFocus
              className="w-full h-full min-h-[32px] px-2 text-sm bg-white border border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleBlur();
              }}
            />
          );
      }
    }

    // Read-only view
    switch (column.type) {
      case 'status':
        return value ? (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            value === 'Done' ? 'bg-green-100 text-green-800' :
            value === 'In Progress' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {value}
          </span>
        ) : null;
      case 'date':
        return value ? <span className="text-gray-600">{new Date(value).toLocaleDateString()}</span> : null;
      default:
        return <span className="text-gray-900 truncate w-full">{value}</span>;
    }
  };

  return (
    <div 
      className={`flex items-center px-4 py-2 border-r border-gray-100 last:border-r-0 h-full relative group/cell ${column.type !== 'checkbox' ? 'cursor-text' : ''}`}
      style={{ width: column.width, minWidth: column.width }}
      onClick={() => {
        if (!isEditing && column.type !== 'checkbox') setIsEditing(true);
      }}
    >
      {renderContent()}
    </div>
  );
}

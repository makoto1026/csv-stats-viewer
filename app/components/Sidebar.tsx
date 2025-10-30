'use client';

interface SidebarProps {
  headers: string[];
  selectedColumn: string | null;
  onSelectColumn: (column: string) => void;
}

export default function Sidebar({
  headers,
  selectedColumn,
  onSelectColumn,
}: SidebarProps) {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          カラム一覧
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {headers.length}個のカラム
        </p>
      </div>

      <nav className="p-2 overflow-y-auto flex-1">
        {headers.map((header) => (
          <button
            key={header}
            onClick={() => onSelectColumn(header)}
            className={`
              w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors
              ${
                selectedColumn === header
                  ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
          >
            <div className="truncate" title={header}>
              {header}
            </div>
          </button>
        ))}
      </nav>
    </aside>
  );
}

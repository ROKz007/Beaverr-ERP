// Dense data screen — per the project's legibility guardrail, kept calm: no per-row motion or
// blur, just a plain table with a quiet hover state.
export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  emptyMessage = "No records yet.",
}: {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return <div className="p-10 text-center text-sm text-white/50">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase tracking-[0.1em] text-white/40">
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-5 py-3 font-medium">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-white/[0.03]">
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-5 py-3 text-white/80">
                  {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

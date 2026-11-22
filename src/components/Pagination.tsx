import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: Props) {
  const btn =
    'flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700';

  return (
    <div className="mt-8 flex items-center justify-center gap-4">
      <button className={btn} disabled={page === 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft size={16} /> Prev
      </button>
      <span className="text-sm text-slate-600 dark:text-slate-400">
        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
      </span>
      <button className={btn} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
}
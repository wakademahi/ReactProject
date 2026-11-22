import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

export interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
}

export default function ComboBox({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  hasError,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const openMenu = () => {
    setOpen(true);
    setQuery('');
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
  };

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const select = (o: Option) => {
    onChange(o.value);
    close();
  };

  // close when clicking outside
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // keep the highlighted option visible while using arrow keys
  useEffect(() => {
    if (!open) return;
    (listRef.current?.children[active] as HTMLElement | undefined)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) return openMenu();
        setActive((i) => Math.max(0, Math.min(i + 1, filtered.length - 1)));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        if (open) {
          e.preventDefault(); // stops the form from submitting
          if (filtered[active]) select(filtered[active]);
        }
        break;
      case 'Escape':
        if (open) {
          e.preventDefault();
          close();
        }
        break;
      case 'Tab':
        close();
        break;
    }
  };

  const inputClass = `w-full rounded-lg border bg-white py-2.5 pl-3 pr-16 text-left text-sm text-slate-900 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:text-slate-100 ${
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-500 dark:focus:ring-red-900'
      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200 dark:border-slate-600 dark:focus:ring-indigo-900'
  }`;

  return (
    <div ref={wrapRef} className="relative">
      <input
        ref={inputRef}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        disabled={disabled}
        value={open ? query : selected?.label ?? ''}
        placeholder={open && selected ? selected.label : placeholder}
        onFocus={() => !open && openMenu()}
        onClick={() => !open && openMenu()}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          if (!open) setOpen(true);
        }}
        onKeyDown={onKeyDown}
        className={inputClass}
      />

      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {value && !disabled && (
          <button
            type="button"
            aria-label="Clear selection"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={14} />
          </button>
        )}
        <ChevronDown
          size={16}
          className={`pointer-events-none text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </div>

      {open && (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-slate-800 text-left">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">No matching categories</p>
          ) : (
            <ul ref={listRef} id={listId} role="listbox">
              {filtered.map((o, i) => (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={o.value === value}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => select(o)}
                  className={`cursor-pointer px-3 py-2 text-sm text-left ${
                    i === active ? 'bg-indigo-50 dark:bg-indigo-900/40' : ''
                  } ${
                    o.value === value
                      ? 'font-semibold text-indigo-600 dark:text-indigo-300'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {o.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
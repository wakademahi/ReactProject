import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Loader2, PackageOpen, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { getCategories, deleteProduct, getProducts } from '../api/products';
import { useDebounce } from '../hooks/useDebounce';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import ComboBox from '../components/ComboBox';

const LIMIT = 10;
const gridClass = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5';
const controlClass =
  'rounded-lg border border-slate-300 bg-white py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-indigo-900';
export default function ProductListPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState(''); // e.g. "price-asc"
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);
  const [sortBy, order] = sort.split('-') as [string, 'asc' | 'desc'];
  const isSearching = Boolean(search.trim());
  const hasFilters = Boolean(search || category || sort);

  // const selectClass =
  //   'rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200';


  const removeMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => toast.error('Delete failed'),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: Infinity,
  });

  const { data, isLoading, isError, isPlaceholderData } = useQuery({
    queryKey: ['products', page, debouncedSearch, category, sort],
    queryFn: () =>
      getProducts({
        limit: LIMIT,
        skip: (page - 1) * LIMIT,
        search: debouncedSearch,
        category,
        sortBy,
        order,
      }),
    placeholderData: (prev) => prev,
  });

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;
  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSort('');
    setPage(1);
  };

  const changePage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Products</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {data ? `${data.total} items found` : 'Loading...'}
          </p>
        </div>
        <Link
          to="/products/new"
          className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          <Plus size={18} /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_200px_200px_auto]">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className={`${controlClass} w-full pl-10 pr-3`}
          />
        </div>

        <ComboBox
          options={[
            { value: '', label: 'All categories' },
            ...(categories ?? []).map((c) => ({ value: c.slug, label: c.name })),
          ]}
          value={category}
          disabled={isSearching}
          onChange={(v) => {
            setCategory(v);
            setPage(1);
          }}
          placeholder="All categories"
        />

        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className={`${controlClass} px-3`}
        >
          <option value="">Sort by</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="title-asc">Title: A to Z</option>
          <option value="title-desc">Title: Z to A</option>
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <X size={16} /> Clear
          </button>
        )}
      </div>

      {isSearching && (
        <p className="-mt-3 mb-5 text-xs text-slate-500 dark:text-slate-400">
          Category filter is paused while searching.
        </p>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <AlertCircle size={18} /> Failed to load products. Please try again.
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      )}

      {/* Empty */}
      {data?.products.length === 0 && (
        <div className="flex flex-col items-center py-20 text-slate-400">
          <PackageOpen size={48} />
          <p className="mt-3">No products found.</p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-3 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {data && data.products.length > 0 && (
        <div className={`${gridClass} transition-opacity ${isPlaceholderData ? 'opacity-60' : 'opacity-100'}`}>
          {data.products.map((p) => {
            const deleting = removeMutation.isPending && removeMutation.variables === p.id;
            return (
              <div
                key={p.id}
                className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition focus-within:ring-2 focus-within:ring-indigo-400 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex h-44 items-center justify-center bg-slate-100 dark:bg-slate-700/50">
                  <img src={p.thumbnail} alt={p.title} className="h-full object-contain" loading="lazy" />
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <span className="mb-2 w-fit rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium capitalize text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {p.category.replace(/-/g, ' ')}
                  </span>
                  <h3 className="line-clamp-1 font-semibold text-slate-900 dark:text-slate-100"><Link
                    to={`/products/${p.id}`}
                    className="line-clamp-1 font-semibold text-slate-900 after:absolute after:inset-0 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400"
                  >
                    {p.title}
                  </Link>
                  </h3>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">${p.price}</span>
                    <span
                      className={`text-xs font-medium ${p.stock > 10 ? 'text-green-600 dark:text-green-400' : 'text-orange-500'
                        }`}
                    >
                      {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  <div className="relative z-10 mt-4 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-700">
                    <Link
                      to={`/products/${p.id}/edit`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-sm font-medium text-slate-700 transition hover:bg-indigo-100 hover:text-indigo-700 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-indigo-900/60 dark:hover:text-indigo-200"
                    >
                      <Pencil size={15} /> Edit
                    </Link>
                    <button
                      disabled={deleting}
                      onClick={() => window.confirm('Delete this product?') && removeMutation.mutate(p.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-sm font-medium text-slate-700 transition hover:bg-red-100 hover:text-red-600 disabled:opacity-60 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-red-900/50 dark:hover:text-red-300"
                    >
                      {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      {deleting ? 'Deleting' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={changePage} />}
    </div>
  );
}
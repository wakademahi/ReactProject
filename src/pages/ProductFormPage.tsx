import { useEffect, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Image as ImageIcon, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { createProduct, getProduct, updateProduct, getCategories } from '../api/products';
import { productSchema, type ProductFormValues } from '../schemas/product';
import ImageUpload from '../components/ImageUpload';
import ComboBox from '../components/ComboBox';

const baseInput =
  'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 dark:bg-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500';
const okInput =
  'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200 dark:border-slate-600 dark:focus:ring-indigo-900';
const badInput = 'border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-500 dark:focus:ring-red-900';

const Field = ({ label, error, children }: { label: string; error?: string; children: ReactNode }) => (
  <div className="grid gap-1.5 sm:grid-cols-[150px_1fr] sm:gap-6">
    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 sm:pt-2.5">{label}</label>
    <div>
      {children}
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400 text-left">{error}</p>}
    </div>
  </div>
);

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,            // ← add
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { title: '', description: '', category: '', price: 0, stock: 0, thumbnail: '' },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(Number(id)),
    enabled: isEdit,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: Infinity,
  });
  useEffect(() => {
    if (data) {
      const { title, description, category, price, stock, thumbnail } = data;
      reset({ title, description, category, price, stock, thumbnail });
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (body: ProductFormValues) =>
      isEdit ? updateProduct(Number(id), body) : createProduct(body),
    onSuccess: () => {
      toast.success(isEdit ? 'Product updated' : 'Product created');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/products');
    },
    onError: () => toast.error('Something went wrong. Please try again.'),
  });

  const fieldClass = (hasError: boolean) => `${baseInput} ${hasError ? badInput : okInput}`;
  const preview = watch();
  const previewPrice = Number.isFinite(preview.price) ? preview.price : 0;
  const previewStock = Number.isFinite(preview.stock) ? preview.stock : 0;

  return (
    <div className="w-full">
      <button
        onClick={() => navigate('/products')}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft size={16} /> Back to products
      </button>

      {(isEdit && isLoading) || categoriesLoading ? (
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">          {/* ← new wrapper */}
          <form
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
            className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8 lg:col-span-2"   // ← lg:col-span-2 added
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h2>
            <Field label="Product image">
              <ImageUpload
                value={preview.thumbnail}
                onChange={(v) => setValue('thumbnail', v, { shouldDirty: true })}
              />
            </Field>
            <Field label="Title" error={errors.title?.message}>
              <input {...register('title')} className={fieldClass(!!errors.title)} placeholder="e.g. Wireless Bluetooth Headphones" />
            </Field>

            <Field label="Description" error={errors.description?.message}>
              <textarea rows={5} {...register('description')} className={fieldClass(!!errors.description)} placeholder="Describe the product: features, material, size..." />
            </Field>

            <Field label="Category" error={errors.category?.message}>
              <ComboBox
                options={(categories ?? []).map((c) => ({ value: c.slug, label: c.name }))}
                value={preview.category}
                onChange={(v) => setValue('category', v, { shouldValidate: true, shouldDirty: true })}
                placeholder="Search or select a category"
                hasError={!!errors.category}
              />
            </Field>

            <Field label="Price ($)" error={errors.price?.message}>
              <input
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                className={fieldClass(!!errors.price)}
                placeholder="e.g. 49.99"
              />
            </Field>

            <Field label="Stock" error={errors.stock?.message}>
              <input
                type="number"
                 placeholder="e.g. 100"
                {...register('stock', { valueAsNumber: true })}
                className={fieldClass(!!errors.stock)}
              />
            </Field>

            <div className="flex justify-end gap-3 pt-2 sm:justify-start sm:pl-[174px]">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                disabled={mutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {mutation.isPending ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </form>
          {/* ← new preview card, right after </form> */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <p className="mb-3 text-sm font-medium text-slate-500 dark:text-slate-400">Live preview</p>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="flex h-52 items-center justify-center bg-slate-100 dark:bg-slate-700/50">
                  {preview.thumbnail ? (
                    <img src={preview.thumbnail} alt={preview.title} className="h-full object-contain" />
                  ) : (
                    <ImageIcon size={48} className="text-slate-300 dark:text-slate-500" />
                  )}
                </div>
                <div className="p-4">
                  <span className="mb-2 inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium capitalize text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {categories?.find((c) => c.slug === preview.category)?.name || 'Category'}
                  </span>
                  <h3 className="line-clamp-1 font-semibold text-slate-900 dark:text-slate-100">
                    {preview.title || 'Product title'}
                  </h3>
                  <p className="mt-1 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">
                    {preview.description || 'Product description will appear here.'}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">${previewPrice}</span>
                    <span className={`text-xs font-medium ${previewStock > 10 ? 'text-green-600 dark:text-green-400' : 'text-orange-500'}`}>
                      {previewStock > 0 ? `${previewStock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>

  );
}
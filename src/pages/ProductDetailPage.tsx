import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    AlertCircle,
    ArrowLeft,
    Image as ImageIcon,
    Loader2,
    Package,
    Pencil,
    RotateCcw,
    ShieldCheck,
    Star,
    Trash2,
    Truck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteProduct, getProduct } from '../api/products';

const Stars = ({ value }: { value: number }) => (
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
            <Star
                key={n}
                size={16}
                className={n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}
            />
        ))}
    </div>
);

const Info = ({ icon, text }: { icon: React.ReactNode; text?: string }) =>
    text ? (
        <div className="flex items-center gap-3 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-slate-700/50 dark:text-slate-200">
            <span className="text-indigo-600 dark:text-indigo-400">{icon}</span>
            {text}
        </div>
    ) : null;

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selected, setSelected] = useState(0);

    const { data: product, isLoading, isError } = useQuery({
        queryKey: ['product', id],
        queryFn: () => getProduct(Number(id)),
        enabled: Boolean(id),
        retry: false,
    });

    const removeMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            toast.success('Product deleted');
            queryClient.invalidateQueries({ queryKey: ['products'] });
            navigate('/products');
        },
        onError: () => toast.error('Delete failed. Please try again.'),
    });

    const backLink = (
        <Link
            to="/products"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-left font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
        >
            <ArrowLeft size={16} /> Back to products
        </Link>
    );

    if (isLoading) {
        return (
            <div>
                {backLink}
                <div className="grid gap-8 lg:grid-cols-2">
                    <div className="h-96 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
                    <div className="space-y-4">
                        <div className="h-8 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                        <div className="h-5 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                        <div className="h-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div>
                {backLink}
                <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white py-20 text-center dark:border-slate-700 dark:bg-slate-800">
                    <AlertCircle size={44} className="text-red-500" />
                    <h2 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">Product not found</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        It may have been removed or the link is incorrect.
                    </p>
                </div>
            </div>
        );
    }

    const gallery = product.images?.length ? product.images : product.thumbnail ? [product.thumbnail] : [];
    const mainImage = gallery[Math.min(selected, gallery.length - 1)];
    const status = product.availabilityStatus ?? (product.stock > 0 ? 'In Stock' : 'Out of Stock');
    const inStock = product.stock > 0;
    const deleting = removeMutation.isPending;

    return (
        <div className="w-full">
            {/* {backLink} */}
            <button
                onClick={() => navigate('/products')}
                className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            >
                <ArrowLeft size={16} /> Back to products
            </button>
            <div className="grid gap-8 lg:grid-cols-2">
                {/* Gallery */}
                <div>
                    <div className="flex h-96 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                        {mainImage ? (
                            <img src={mainImage} alt={product.title} className="h-full object-contain" />
                        ) : (
                            <ImageIcon size={64} className="text-slate-300 dark:text-slate-600" />
                        )}
                    </div>

                    {gallery.length > 1 && (
                        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                            {gallery.map((src, i) => (
                                <button
                                    key={src}
                                    onClick={() => setSelected(i)}
                                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition dark:bg-slate-800 ${i === selected
                                            ? 'border-indigo-500'
                                            : 'border-slate-200 hover:border-indigo-300 dark:border-slate-700'
                                        }`}
                                >
                                    <img src={src} alt="" className="h-full w-full object-contain" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details */}
                <div>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium capitalize text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                        {product.category.replace(/-/g, ' ')}
                    </span>

                    <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{product.title}</h1>
                    {product.brand && <p className="mt-1 text-slate-500 dark:text-slate-400">by {product.brand}</p>}

                    {product.rating !== undefined && (
                        <div className="mt-3 flex items-center gap-2">
                            <Stars value={product.rating} />
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                {product.rating.toFixed(1)}
                                {product.reviews ? ` (${product.reviews.length} reviews)` : ''}
                            </span>
                        </div>
                    )}

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        <span className="text-4xl font-bold text-slate-900 dark:text-white">${product.price}</span>
                        {product.discountPercentage ? (
                            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                {Math.round(product.discountPercentage)}% off
                            </span>
                        ) : null}
                        <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${inStock
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                }`}
                        >
                            {status}
                        </span>
                    </div>

                    <p className="mt-5 leading-relaxed text-slate-600 dark:text-slate-300">{product.description}</p>

                    {product.tags && product.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {product.tags.map((t) => (
                                <span
                                    key={t}
                                    className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                >
                                    #{t}
                                </span>
                            ))}
                        </div>
                    )}

                    <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-slate-200 pt-6 text-sm dark:border-slate-700">
                        <div>
                            <dt className="text-slate-500 dark:text-slate-400">Stock</dt>
                            <dd className="font-medium text-slate-900 dark:text-slate-100">{product.stock} units</dd>
                        </div>
                        {product.sku && (
                            <div>
                                <dt className="text-slate-500 dark:text-slate-400">SKU</dt>
                                <dd className="font-medium text-slate-900 dark:text-slate-100">{product.sku}</dd>
                            </div>
                        )}
                        {product.minimumOrderQuantity && (
                            <div>
                                <dt className="text-slate-500 dark:text-slate-400">Minimum order</dt>
                                <dd className="font-medium text-slate-900 dark:text-slate-100">{product.minimumOrderQuantity}</dd>
                            </div>
                        )}
                        {product.weight && (
                            <div>
                                <dt className="text-slate-500 dark:text-slate-400">Weight</dt>
                                <dd className="font-medium text-slate-900 dark:text-slate-100">{product.weight}</dd>
                            </div>
                        )}
                        {product.dimensions && (
                            <div className="col-span-2">
                                <dt className="text-slate-500 dark:text-slate-400">Dimensions (W x H x D)</dt>
                                <dd className="font-medium text-slate-900 dark:text-slate-100">
                                    {product.dimensions.width} x {product.dimensions.height} x {product.dimensions.depth}
                                </dd>
                            </div>
                        )}
                    </dl>

                    <div className="mt-6 grid gap-3 sm:grid-cols-1">
                        <Info icon={<Truck size={18} />} text={product.shippingInformation} />
                        <Info icon={<ShieldCheck size={18} />} text={product.warrantyInformation} />
                        <Info icon={<RotateCcw size={18} />} text={product.returnPolicy} />
                        {!product.shippingInformation && !product.warrantyInformation && !product.returnPolicy && (
                            <Info icon={<Package size={18} />} text="Shipping and warranty details are not available." />
                        )}
                    </div>

                    <div className="mt-8 flex gap-3">
                        <Link
                            to={`/products/${product.id}/edit`}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
                        >
                            <Pencil size={16} /> Edit
                        </Link>
                        <button
                            disabled={deleting}
                            onClick={() => window.confirm('Delete this product?') && removeMutation.mutate(product.id)}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-300 px-5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
                        >
                            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            {deleting ? 'Deleting' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Reviews */}
            {product.reviews && product.reviews.length > 0 && (
                <section className="mt-12">
                    <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Customer reviews</h2>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {product.reviews.map((r, i) => (
                            <div
                                key={i}
                                className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
                            >
                                <div className="flex items-center justify-between">
                                    <Stars value={r.rating} />
                                    <span className="text-xs text-slate-400">{new Date(r.date).toLocaleDateString()}</span>
                                </div>
                                <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">{r.comment}</p>
                                <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">{r.reviewerName}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
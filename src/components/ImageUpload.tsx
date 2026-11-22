import { useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from 'react';
import { Trash2, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_SIZE_MB = 5;
const MAX_DIMENSION = 800;

// Resize in the browser so the payload stays small
function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(objectUrl);
                return reject(new Error('Canvas not supported'));
            }
            ctx.fillStyle = '#ffffff'; // avoids black background on transparent PNGs
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            URL.revokeObjectURL(objectUrl);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Could not read image'));
        };

        img.src = objectUrl;
    });
}

interface Props {
    value?: string;
    onChange: (value: string) => void;
}

export default function ImageUpload({ value, onChange }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleFile = async (file?: File) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please choose an image file (PNG, JPG, WEBP...)');
            return;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            toast.error(`Image must be smaller than ${MAX_SIZE_MB} MB`);
            return;
        }
        setProcessing(true);
        try {
            onChange(await fileToDataUrl(file));
        } catch {
            toast.error('Could not process this image');
        } finally {
            setProcessing(false);
        }
    };

    const onDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files?.[0]);
    };

    const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        handleFile(e.target.files?.[0]);
        e.target.value = ''; // lets you pick the same file again
    };

    const openPicker = () => inputRef.current?.click();

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPicker();
        }
    };

    return (
        <div>
            <input ref={inputRef} type="file" accept="image/*" onChange={onInputChange} className="hidden" />

            {value ? (
                <div className="relative overflow-hidden rounded-xl border border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-700/50">
                    <img src={value} alt="Product preview" className="mx-auto h-56 object-contain" />
                    <div className="absolute right-3 top-3 flex gap-2">
                        <button
                            type="button"
                            onClick={openPicker}
                            className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow hover:bg-white dark:bg-slate-800/90 dark:text-slate-200"
                        >
                            Change
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange('')}
                            aria-label="Remove image"
                            className="rounded-lg bg-white/90 p-1.5 text-red-600 shadow hover:bg-white dark:bg-slate-800/90"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    role="button"
                    tabIndex={0}
                    onClick={openPicker}
                    onKeyDown={onKeyDown}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 text-center transition ${dragging
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700/40'
                        }`}
                >
                    <UploadCloud size={36} className={dragging ? 'text-indigo-500' : 'text-slate-400'} />
                    <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                        {processing ? 'Processing...' : dragging ? 'Drop image here' : 'Drag and drop an image, or click to upload'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">PNG, JPG or WEBP up to {MAX_SIZE_MB} MB</p>
                </div>
            )}
        </div>
    );
}
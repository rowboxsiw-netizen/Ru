import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Save } from 'lucide-react';
import { Product, Category } from '../types';

const schema = z.object({
  name: z.string().min(2, "Product name required"),
  sku: z.string().min(2, "SKU required"),
  category: z.nativeEnum(Category),
  supplier: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
  lastRestocked: z.string().min(1, "Date required"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => void;
  initialData?: Product | null;
  isSaving: boolean;
}

const InventoryModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData, isSaving }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', sku: '', category: Category.ELECTRONICS, supplier: '',
      price: 0, quantity: 0, lastRestocked: new Date().toISOString().split('T')[0]
    }
  });

  React.useEffect(() => {
    if (initialData) {
      setValue('name', initialData.name);
      setValue('sku', initialData.sku);
      setValue('category', initialData.category);
      setValue('supplier', initialData.supplier || '');
      setValue('price', initialData.price);
      setValue('quantity', initialData.quantity);
      setValue('lastRestocked', initialData.lastRestocked);
    } else {
        reset({
            name: '', sku: '', category: Category.ELECTRONICS,
            price: 0, quantity: 0, lastRestocked: new Date().toISOString().split('T')[0]
        });
    }
  }, [initialData, isOpen, reset, setValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">{initialData ? 'Edit Product' : 'New Stock Item'}</h2>
          <button onClick={onClose}><X size={24} className="text-gray-400" /></button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Product Name</label>
              <input {...register('name')} className="input" placeholder="e.g. Wireless Mouse" />
              {errors.name && <span className="error">{errors.name.message}</span>}
            </div>
            
            <div>
              <label className="label">SKU / Barcode</label>
              <input {...register('sku')} className="input" placeholder="e.g. WM-001" />
              {errors.sku && <span className="error">{errors.sku.message}</span>}
            </div>

            <div>
              <label className="label">Category</label>
              <select {...register('category')} className="input bg-white">
                {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Price (₹)</label>
              <input {...register('price')} type="number" className="input" />
              {errors.price && <span className="error">{errors.price.message}</span>}
            </div>

            <div>
              <label className="label">Quantity</label>
              <input {...register('quantity')} type="number" className="input" />
              {errors.quantity && <span className="error">{errors.quantity.message}</span>}
            </div>

            <div>
              <label className="label">Supplier</label>
              <input {...register('supplier')} className="input" placeholder="e.g. ABC Distributors" />
            </div>

            <div>
              <label className="label">Last Restock</label>
              <input {...register('lastRestocked')} type="date" className="input" />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70">
              <Save size={18} /> {isSaving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; }
        .input { width: 100%; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; outline: none; transition: all; }
        .input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }
        .error { font-size: 0.75rem; color: #ef4444; }
      `}</style>
    </div>
  );
};

export default InventoryModal;
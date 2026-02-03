import React, { useState, useMemo } from 'react';
import { 
  Search, Download, Plus, Filter, Upload, 
  Package, DollarSign, AlertTriangle, Tag 
} from 'lucide-react';
import { Product, OCRResult } from '../types';
import { generateOfflineForm, generateMasterReport } from '../services/pdfService';
import { SkeletonRow, SkeletonCard } from './Skeleton';
import { DEFAULT_PRODUCT_IMG } from '../constants';
import InventoryModal from './EmployeeModal'; // Reusing file path for Inventory Modal
import OCRModal from './OCRModal';
import { addDoc, collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface Props {
  employees: Product[]; // Mapping 'employees' prop to Product type for compatibility
  loading: boolean;
}

const Dashboard: React.FC<Props> = ({ employees: products, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOCRModalOpen, setIsOCRModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Stats Calculation
  const stats = useMemo(() => {
    const totalItems = products.length;
    const totalValue = products.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const lowStock = products.filter(p => p.quantity < 10).length;
    return { totalItems, totalValue, lowStock };
  }, [products]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCat === 'All' || p.category === filterCat;
    return matchesSearch && matchesFilter;
  });

  const handleSaveProduct = async (data: any) => {
    setIsSaving(true);
    try {
      if (editingProduct && editingProduct.id) {
        await updateDoc(doc(db, 'products', editingProduct.id), data);
      } else {
        await addDoc(collection(db, 'products'), {
            ...data,
            createdAt: new Date(),
            image: DEFAULT_PRODUCT_IMG
        });
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save product.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if(!id) return;
    if(confirm("Delete this product from inventory?")) {
        await deleteDoc(doc(db, 'products', id));
    }
  }

  const handleOCRConfirm = (data: OCRResult) => {
    setIsOCRModalOpen(false);
    const placeholder: any = {
        name: data.name,
        sku: data.sku || `SKU-${Date.now().toString().slice(-4)}`,
        category: data.category,
        supplier: data.supplier,
        price: data.price || 0,
        quantity: data.quantity || 1,
        lastRestocked: new Date().toISOString().split('T')[0]
    };
    setEditingProduct(placeholder);
    setIsModalOpen(true);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Inventory</h2>
          <p className="text-slate-500 mt-1">Track stock levels and value.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={generateOfflineForm} className="btn-secondary flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
            <Download size={18} /> <span className="hidden sm:inline">Stock Form</span>
          </button>
          <button onClick={() => setIsOCRModalOpen(true)} className="btn-primary flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <Upload size={18} /> <span className="hidden sm:inline">Scan Stock</span>
          </button>
          <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200">
            <Plus size={18} /> <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         {loading ? <SkeletonCard /> : (
            <>
                <div className="stat-card bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Total Inventory Value</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(stats.totalValue)}</h3>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg"><DollarSign size={24} /></div>
                </div>
                <div className="stat-card bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Unique Products</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalItems}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Package size={24} /></div>
                </div>
                <div className="stat-card bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Low Stock Alerts</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.lowStock}</h3>
                    </div>
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><AlertTriangle size={24} /></div>
                </div>
            </>
         )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Search products, SKU..." 
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
             <select 
                value={filterCat} onChange={e => setFilterCat(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-600 outline-none focus:border-blue-500"
             >
                <option value="All">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Groceries">Groceries</option>
                <option value="Furniture">Furniture</option>
                <option value="Clothing">Clothing</option>
             </select>
             <button onClick={() => generateMasterReport(products)} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Export</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Value</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={6}><SkeletonRow /></td></tr>) : 
               filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 group transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                            <Tag size={20} />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{p.name}</div>
                          <div className="text-xs text-slate-500">SKU: {p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">{p.category}</span></td>
                    <td className="p-4 text-slate-700">{formatCurrency(p.price)}</td>
                    <td className="p-4">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${p.quantity < 10 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${p.quantity < 10 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                            {p.quantity} Units
                        </div>
                    </td>
                    <td className="p-4 font-medium text-slate-900">{formatCurrency(p.price * p.quantity)}</td>
                    <td className="p-4 text-right">
                        <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="text-blue-600 text-sm hover:underline mr-3">Edit</button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 text-sm hover:underline">Delete</button>
                    </td>
                  </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>

      <InventoryModal 
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct} initialData={editingProduct} isSaving={isSaving}
      />
      <OCRModal 
        isOpen={isOCRModalOpen} onClose={() => setIsOCRModalOpen(false)}
        onConfirm={handleOCRConfirm}
      />
    </div>
  );
};

export default Dashboard;
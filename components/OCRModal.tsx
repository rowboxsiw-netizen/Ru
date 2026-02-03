import React, { useState } from 'react';
import { Upload, Check, RefreshCw, Camera, AlertCircle, Package, Image as ImageIcon, X } from 'lucide-react';
import { processImageFile } from '../services/ocrService';
import { OCRResult } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: OCRResult) => void;
}

const OCRModal: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      const data = await processImageFile(file);
      setResult(data);
    } catch (err) {
      setError("Failed to read invoice/label. Try a clearer image.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex overflow-hidden flex-col md:flex-row">
        
        {/* Left: Scan Area */}
        <div className="w-full md:w-1/2 bg-slate-50 p-6 flex flex-col border-r border-gray-200">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <Camera size={20} className="text-blue-600" />
               Scan Inventory
             </h3>
             {preview && (
                 <button onClick={handleClear} className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1 font-medium">
                    <X size={14} /> Clear
                 </button>
             )}
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
            {preview ? (
              <div className="relative flex-1 rounded-xl overflow-hidden border border-gray-200 bg-black flex items-center justify-center">
                 <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4 justify-center">
                 {/* Option 1: Camera */}
                 <label className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-xl cursor-pointer hover:bg-blue-50 transition-all group">
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Camera size={32} className="text-blue-600" />
                    </div>
                    <span className="font-bold text-slate-700">Take Photo</span>
                    <span className="text-xs text-slate-500 mt-1">Use Device Camera</span>
                    <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        className="hidden" 
                        onChange={handleFileChange} 
                    />
                 </label>

                 <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-semibold uppercase">Or</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                 </div>

                 {/* Option 2: Gallery */}
                 <label className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 bg-white rounded-xl cursor-pointer hover:bg-slate-50 transition-all group">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <ImageIcon size={24} className="text-slate-500" />
                    </div>
                    <span className="font-semibold text-slate-600">Upload Image</span>
                    <span className="text-xs text-slate-400 mt-1">Select from Gallery</span>
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileChange} 
                    />
                 </label>
              </div>
            )}
          </div>

          <button 
            onClick={handleProcess} 
            disabled={!file || isProcessing}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-blue-200 font-medium transition-all"
          >
            {isProcessing ? <><RefreshCw className="animate-spin" size={18} /> Analyzing...</> : "Process Image"}
          </button>
          
          <div className="text-center mt-3">
             <button onClick={onClose} className="text-sm text-slate-400 hover:text-slate-600">Cancel</button>
          </div>
        </div>

        {/* Right: Verification */}
        <div className="w-full md:w-1/2 p-6 flex flex-col bg-white overflow-y-auto">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Verify Details</h3>
          
          {result ? (
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg border border-green-100 flex gap-3">
                <Check size={18} className="text-green-600" />
                <div>
                    <h4 className="text-sm font-bold text-green-800">Scan Successful</h4>
                    <p className="text-xs text-green-600">AI Confidence: {Math.round(result.confidence * 100)}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Product Name</label>
                    <input value={result.name} onChange={e => setResult({...result, name: e.target.value})} className="w-full p-2 border rounded" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">SKU</label>
                    <input value={result.sku} onChange={e => setResult({...result, sku: e.target.value})} className="w-full p-2 border rounded" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                    <input value={result.category} onChange={e => setResult({...result, category: e.target.value})} className="w-full p-2 border rounded" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Price (₹)</label>
                    <input type="number" value={result.price} onChange={e => setResult({...result, price: Number(e.target.value)})} className="w-full p-2 border rounded" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Quantity</label>
                    <input type="number" value={result.quantity} onChange={e => setResult({...result, quantity: Number(e.target.value)})} className="w-full p-2 border rounded" />
                 </div>
                 <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Supplier</label>
                    <input value={result.supplier} onChange={e => setResult({...result, supplier: e.target.value})} className="w-full p-2 border rounded" />
                 </div>
              </div>

              <button onClick={() => onConfirm(result)} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold mt-4 shadow-lg shadow-green-100">Add to Inventory</button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
               {error ? (
                   <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex flex-col items-center">
                       <AlertCircle size={32} className="mb-2"/>
                       <p className="text-sm font-medium">{error}</p>
                       <button onClick={handleClear} className="mt-2 text-xs underline">Try Again</button>
                   </div>
               ) : (
                   <>
                       <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                           <Package size={40} className="text-slate-300" />
                       </div>
                       <h4 className="text-slate-600 font-medium">Ready to Scan</h4>
                       <p className="text-sm text-slate-400 mt-1 max-w-xs">Upload a clear photo of a product label, price tag, or invoice to automatically extract details.</p>
                   </>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OCRModal;
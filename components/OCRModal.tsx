import React, { useState } from 'react';
import { Upload, Check, RefreshCw, Camera, AlertCircle, Package } from 'lucide-react';
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
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Camera size={20} className="text-blue-600" />
            Scan Inventory
          </h3>
          
          <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center relative overflow-hidden bg-white hover:bg-slate-50 transition-colors group">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Camera size={24} />
                </div>
                <p className="text-gray-600 font-medium mb-1">Capture Label / Invoice</p>
                <p className="text-xs text-gray-400">Supports JPG, PNG</p>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
          </div>

          <button 
            onClick={handleProcess} disabled={!file || isProcessing}
            className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isProcessing ? <><RefreshCw className="animate-spin" size={18} /> Analyzing...</> : "Process Image"}
          </button>
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

              <button onClick={() => onConfirm(result)} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold mt-4">Add to Inventory</button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
               {error ? <div className="text-red-500"><AlertCircle size={32} className="mx-auto mb-2"/>{error}</div> : 
               <><Package size={48} className="text-gray-200 mb-4"/><p>Scan a product label to auto-fill details.</p></>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OCRModal;
import React, { useState } from 'react';
import { Upload, Check, RefreshCw, FileText, AlertCircle, Camera } from 'lucide-react';
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
      setError("Failed to extract text. Please ensure the image is clear and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex overflow-hidden flex-col md:flex-row">
        
        {/* Left: Upload/Preview */}
        <div className="w-full md:w-1/2 bg-slate-50 p-6 flex flex-col border-r border-gray-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Camera size={20} className="text-blue-600" />
            Smart Scan
          </h3>
          
          <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center relative overflow-hidden bg-white hover:bg-slate-50 transition-colors group">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Camera size={24} />
                </div>
                <p className="text-gray-600 font-medium mb-1">Tap to Take Photo</p>
                <p className="text-xs text-gray-400">or upload a file</p>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*"
              capture="environment" // Launches back camera on mobile directly
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileChange} 
            />
          </div>

          <div className="mt-4 flex gap-3">
             <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancel</button>
             <button 
                onClick={handleProcess}
                disabled={!file || isProcessing}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2 transition-all shadow-blue-200 shadow-lg"
             >
                {isProcessing ? (
                   <><RefreshCw className="animate-spin" size={18} /> Scanning Form...</>
                ) : (
                   <><FileText size={18} /> Extract Data</>
                )}
             </button>
          </div>
        </div>

        {/* Right: Results/Verification */}
        <div className="w-full md:w-1/2 p-6 flex flex-col bg-white overflow-y-auto">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Verification</h3>
          
          {result ? (
            <div className="flex-1 flex flex-col space-y-4">
              <div className="p-3 bg-green-50 rounded-lg border border-green-100 flex items-start gap-3">
                <Check size={18} className="text-green-600 mt-0.5" />
                <div>
                    <h4 className="text-sm font-semibold text-green-800">Scan Complete</h4>
                    <p className="text-xs text-green-600">Confidence: {Math.round(result.confidence * 100)}%</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
                    <input 
                      value={result.fullName} 
                      onChange={(e) => setResult({...result, fullName: e.target.value})}
                      className="w-full p-2 border border-gray-200 rounded text-gray-800 focus:border-blue-500 outline-none" 
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                    <input 
                      value={result.email} 
                      onChange={(e) => setResult({...result, email: e.target.value})}
                      className="w-full p-2 border border-gray-200 rounded text-gray-800 focus:border-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Department</label>
                    <input 
                      value={result.department} 
                      onChange={(e) => setResult({...result, department: e.target.value})}
                      className="w-full p-2 border border-gray-200 rounded text-gray-800 focus:border-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Designation</label>
                    <input 
                      value={result.designation} 
                      onChange={(e) => setResult({...result, designation: e.target.value})}
                      className="w-full p-2 border border-gray-200 rounded text-gray-800 focus:border-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Salary (₹)</label>
                    <input 
                      type="number"
                      value={result.salary} 
                      onChange={(e) => setResult({...result, salary: Number(e.target.value)})}
                      className="w-full p-2 border border-gray-200 rounded text-gray-800 focus:border-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Join Date</label>
                    <input 
                      type="date"
                      value={result.joinDate} 
                      onChange={(e) => setResult({...result, joinDate: e.target.value})}
                      className="w-full p-2 border border-gray-200 rounded text-gray-800 focus:border-blue-500 outline-none" 
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                 <button 
                    onClick={() => onConfirm(result)}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 shadow-lg shadow-green-900/10 font-medium"
                 >
                    Confirm Data
                 </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
              {error ? (
                <div className="text-red-500 flex flex-col items-center">
                   <AlertCircle size={32} className="mb-2"/>
                   <p>{error}</p>
                </div>
              ) : (
                 <>
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                     <FileText size={32} className="text-slate-200" />
                  </div>
                  <p className="max-w-xs text-sm">Upload a form or take a picture to automatically fill the fields.</p>
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
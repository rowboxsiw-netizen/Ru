import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './services/firebase';
import { Product } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time Firestore Sync (Products Collection)
  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prodData: Product[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
      
      setProducts(prodData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
      case 'employees': // Mapped to Inventory in Sidebar
        return <Dashboard employees={products} loading={loading} />;
      case 'orders':
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <div className="bg-white p-12 rounded-2xl shadow-sm border text-center">
                    <h2 className="text-xl font-bold text-slate-700 mb-2">Order Management</h2>
                    <p className="mb-6">Purchase Orders and Sales processing module.</p>
                </div>
            </div>
        );
      case 'reports':
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <div className="bg-white p-12 rounded-2xl shadow-sm border text-center">
                    <h2 className="text-xl font-bold text-slate-700 mb-2">Analytics</h2>
                    <p className="mb-6">Sales trends and inventory turnover reports.</p>
                </div>
            </div>
        );
      case 'settings':
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <div className="bg-white p-12 rounded-2xl shadow-sm border text-center">
                    <h2 className="text-xl font-bold text-slate-700 mb-2">Warehouse Settings</h2>
                    <p>Configure warehouse locations and users.</p>
                </div>
            </div>
        );
      default:
        return <Dashboard employees={products} loading={loading} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      <main className="flex-1 h-screen overflow-y-auto relative">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
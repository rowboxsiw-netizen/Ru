import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './services/firebase';
import { Employee } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time Firestore Sync
  useEffect(() => {
    const q = query(collection(db, 'employees'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const empData: Employee[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Employee));
      
      setEmployees(empData);
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
      case 'employees':
        return <Dashboard employees={employees} loading={loading} />;
      case 'reports':
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <div className="bg-white p-12 rounded-2xl shadow-sm border text-center">
                    <h2 className="text-xl font-bold text-slate-700 mb-2">Reports Center</h2>
                    <p className="mb-6">Advanced analytics modules are coming soon.</p>
                    <button onClick={() => setCurrentView('dashboard')} className="text-blue-600 hover:underline">Return to Dashboard</button>
                </div>
            </div>
        );
      case 'settings':
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <div className="bg-white p-12 rounded-2xl shadow-sm border text-center">
                    <h2 className="text-xl font-bold text-slate-700 mb-2">System Settings</h2>
                    <p>Configuration options are restricted to admin users.</p>
                </div>
            </div>
        );
      default:
        return <Dashboard employees={employees} loading={loading} />;
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
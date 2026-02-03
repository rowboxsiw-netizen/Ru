import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  Plus, 
  Filter, 
  MoreVertical, 
  Upload,
  Users,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { Employee, OCRResult } from '../types';
import { generateOfflineForm, generateMasterReport } from '../services/pdfService';
import { SkeletonRow, SkeletonCard } from './Skeleton';
import { DEFAULT_AVATAR } from '../constants';
import EmployeeModal from './EmployeeModal';
import OCRModal from './OCRModal';
import { addDoc, collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface Props {
  employees: Employee[];
  loading: boolean;
}

const Dashboard: React.FC<Props> = ({ employees, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  
  // Modals
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [isOCRModalOpen, setIsOCRModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // OCR Pre-fill Data
  const [prefillData, setPrefillData] = useState<Partial<Employee> | null>(null);

  // Stats
  const stats = useMemo(() => {
    const total = employees.length;
    const salary = employees.reduce((acc, curr) => acc + curr.salary, 0);
    const engineering = employees.filter(e => e.department === 'Engineering').length;
    return {
      total,
      avgSalary: total ? Math.round(salary / total) : 0,
      engineering
    };
  }, [employees]);

  // Filter Logic
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterDept === 'All' || emp.department === filterDept;
    return matchesSearch && matchesFilter;
  });

  const handleSaveEmployee = async (data: any) => {
    setIsSaving(true);
    try {
      if (editingEmp && editingEmp.id) {
        await updateDoc(doc(db, 'employees', editingEmp.id), data);
      } else {
        await addDoc(collection(db, 'employees'), {
            ...data,
            createdAt: new Date(),
            profileImage: DEFAULT_AVATAR
        });
      }
      setIsEmpModalOpen(false);
      setEditingEmp(null);
      setPrefillData(null);
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save employee.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setIsEmpModalOpen(true);
  };

  const handleDelete = async (id?: string) => {
    if(!id) return;
    if(confirm("Are you sure you want to delete this employee?")) {
        await deleteDoc(doc(db, 'employees', id));
    }
  }

  const handleOCRConfirm = (data: OCRResult) => {
    setIsOCRModalOpen(false);
    
    // Automatically generate an Employee ID
    const autoId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

    const placeholder: any = {
        fullName: data.fullName,
        email: data.email || '',
        department: data.department,
        designation: data.designation,
        employeeId: autoId, // Auto-generated ID
        salary: data.salary || 0,
        joinDate: data.joinDate || new Date().toISOString().split('T')[0]
    };
    
    setEditingEmp(placeholder);
    setIsEmpModalOpen(true);
  };

  // Helper for Indian Currency Formatting
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Overview</h2>
          <p className="text-slate-500 mt-1">Manage your team and enrollment.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={generateOfflineForm}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Template</span>
          </button>
          
          <button 
            onClick={() => setIsOCRModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Upload size={18} />
            <span className="hidden sm:inline">Smart Scan</span>
          </button>

          <button 
            onClick={() => { setEditingEmp(null); setIsEmpModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-blue-200 shadow-lg"
          >
            <Plus size={18} />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         {loading ? (
             <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
             </>
         ) : (
            <>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Employees</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</h3>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                        <Users size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Avg. Salary</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(stats.avgSalary)}</h3>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-green-600">
                        <span className="text-2xl font-bold">₹</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Engineering Dept</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.engineering}</h3>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-purple-600">
                        <Briefcase size={24} />
                    </div>
                </div>
            </>
         )}
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
                <select 
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    className="appearance-none pl-10 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 focus:border-blue-500 outline-none cursor-pointer"
                >
                    <option value="All">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Human Resources">HR</option>
                </select>
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
            <button 
                onClick={() => generateMasterReport(employees)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            >
                Export Report
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="p-4">Employee</th>
                <th className="p-4">Department</th>
                <th className="p-4">Designation</th>
                <th className="p-4">Status</th>
                <th className="p-4">Salary</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i}><td colSpan={6}><SkeletonRow /></td></tr>
                  ))}
                </>
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={emp.profileImage || DEFAULT_AVATAR} 
                          alt="" 
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-medium text-slate-900">{emp.fullName}</div>
                          <div className="text-xs text-slate-500">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {emp.department}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 text-sm">{emp.designation}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-xs text-slate-600">Active</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-900 font-medium text-sm">
                      {formatCurrency(emp.salary)}
                    </td>
                    <td className="p-4 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(emp)} className="text-blue-600 hover:underline text-sm font-medium">Edit</button>
                            <button onClick={() => handleDelete(emp.id)} className="text-red-500 hover:underline text-sm font-medium">Delete</button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    No employees found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination (Visual Only for UI completeness in this scope) */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
            <span>Showing 1 to {filteredEmployees.length} of {employees.length} results</span>
            <div className="flex gap-2">
                <button disabled className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
                <button disabled className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
            </div>
        </div>
      </div>

      <EmployeeModal 
        isOpen={isEmpModalOpen} 
        onClose={() => setIsEmpModalOpen(false)} 
        onSave={handleSaveEmployee}
        initialData={editingEmp}
        isSaving={isSaving}
      />
      
      <OCRModal 
        isOpen={isOCRModalOpen} 
        onClose={() => setIsOCRModalOpen(false)}
        onConfirm={handleOCRConfirm}
      />
    </div>
  );
};

export default Dashboard;
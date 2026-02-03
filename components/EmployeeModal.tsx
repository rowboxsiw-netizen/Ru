import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Save } from 'lucide-react';
import { Employee, Department } from '../types';
import { DEPARTMENTS } from '../constants';

const schema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  employeeId: z.string().min(3, "ID required"),
  department: z.nativeEnum(Department),
  designation: z.string().min(2, "Role required"),
  salary: z.coerce.number().min(1, "Salary must be positive"),
  joinDate: z.string().min(1, "Date required"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => void;
  initialData?: Employee | null;
  isSaving: boolean;
}

const EmployeeModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData, isSaving }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      employeeId: '',
      department: Department.ENGINEERING,
      designation: '',
      salary: 0,
      joinDate: new Date().toISOString().split('T')[0],
    }
  });

  React.useEffect(() => {
    if (initialData) {
      setValue('fullName', initialData.fullName);
      setValue('email', initialData.email);
      setValue('employeeId', initialData.employeeId);
      setValue('department', initialData.department);
      setValue('designation', initialData.designation);
      setValue('salary', initialData.salary);
      setValue('joinDate', initialData.joinDate);
    } else {
        reset({
            fullName: '',
            email: '',
            employeeId: `EMP-${Math.floor(Math.random() * 10000)}`,
            department: Department.ENGINEERING,
            designation: '',
            salary: 500000, // Default 5 Lakhs
            joinDate: new Date().toISOString().split('T')[0],
        });
    }
  }, [initialData, setValue, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? 'Edit Employee' : 'New Employee'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input {...register('fullName')} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              {errors.fullName && <span className="text-red-500 text-xs">{errors.fullName.message}</span>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
              <input {...register('employeeId')} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              {errors.employeeId && <span className="text-red-500 text-xs">{errors.employeeId.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input {...register('email')} type="email" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select {...register('department')} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                {Object.values(Department).map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <input {...register('designation')} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              {errors.designation && <span className="text-red-500 text-xs">{errors.designation.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary (₹)</label>
              <input {...register('salary')} type="number" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              {errors.salary && <span className="text-red-500 text-xs">{errors.salary.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
              <input {...register('joinDate')} type="date" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              {errors.joinDate && <span className="text-red-500 text-xs">{errors.joinDate.message}</span>}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
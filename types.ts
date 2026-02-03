export interface Employee {
  id?: string;
  fullName: string;
  email: string;
  employeeId: string;
  department: Department;
  designation: string;
  salary: number;
  joinDate: string; // ISO Date string
  profileImage?: string;
  createdAt?: any; // Firestore Timestamp
}

export enum Department {
  ENGINEERING = 'Engineering',
  HR = 'Human Resources',
  SALES = 'Sales',
  MARKETING = 'Marketing',
  FINANCE = 'Finance',
  OPERATIONS = 'Operations'
}

export interface OCRResult {
  fullName: string;
  department: string;
  designation: string;
  confidence: number;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  trend?: string;
  color?: string;
}

export type SortField = 'fullName' | 'department' | 'salary' | 'joinDate';
export type SortOrder = 'asc' | 'desc';
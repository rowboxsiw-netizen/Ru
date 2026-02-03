export interface Product {
  id?: string;
  name: string;
  sku: string; // Stock Keeping Unit
  category: Category;
  supplier: string;
  price: number; // Unit Price
  quantity: number; // Stock Level
  lastRestocked: string; // ISO Date
  image?: string;
  createdAt?: any;
}

export enum Category {
  ELECTRONICS = 'Electronics',
  FURNITURE = 'Furniture',
  GROCERIES = 'Groceries',
  CLOTHING = 'Clothing',
  HARDWARE = 'Hardware',
  PHARMA = 'Pharma'
}

export interface OCRResult {
  name: string;
  sku: string;
  category: string;
  supplier: string;
  price: number;
  quantity: number;
  confidence: number;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  trend?: string;
  color?: string;
}

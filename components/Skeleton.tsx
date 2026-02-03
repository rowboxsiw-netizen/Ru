import React from 'react';

export const SkeletonRow = () => (
  <div className="animate-pulse flex space-x-4 border-b border-gray-200 p-4">
    <div className="rounded-full bg-gray-200 h-10 w-10"></div>
    <div className="flex-1 space-y-2 py-1">
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-1/6 mt-2"></div>
  </div>
);

export const SkeletonCard = () => (
    <div className="animate-pulse bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-32">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
    </div>
);
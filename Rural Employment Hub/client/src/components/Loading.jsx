import React from "react";

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
  </div>
);

export const Skeleton = ({ count = 1, className = "" }) => (
  <>
    {Array(count)
      .fill(0)
      .map((_, i) => (
        <div key={i} className={`skeleton h-4 mb-4 ${className}`}></div>
      ))}
  </>
);

export const EmptyState = ({ icon: Icon, title, message }) => (
  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
    {Icon && <Icon size={48} className="mb-4" />}
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-center">{message}</p>
  </div>
);

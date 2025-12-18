import React from 'react';

export default function Layout({ children, currentPageName }) {
  // Admin pages handle their own layout with sidebar
  const isAdminPage = currentPageName?.startsWith('Admin');
  
  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
'use client';

import React from 'react';
import PublicNavbar from './PublicNavbar';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <PublicNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
        {children}
      </main>
    </div>
  );
};
export default ClientLayout;

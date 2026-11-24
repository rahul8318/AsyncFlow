import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { useAuth } from '../../context/AuthContext';

export const AppLayout: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#fafafa]">
        <div className="space-y-3 w-64 text-center">
          <div className="flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
          </div>
          <p className="text-xs font-medium text-zinc-500 font-mono tracking-tight">Initializing AsyncFlow...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 antialiased">
      <AppSidebar />
      <div className="pl-60 flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

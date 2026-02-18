import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';

export default function ProtectedRoute() {
  const isAuthenticated = false;
  const isLoading = false;

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <p>Loading...</p>
      </div>
    )
  }

  return isAuthenticated ? (
    <AppLayout>
        <Outlet />
    </AppLayout>
  ) : (
    <Navigate to="/login" replace />
  )
}

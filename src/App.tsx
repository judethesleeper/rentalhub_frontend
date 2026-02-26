import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/lib/AuthContext';

import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';

import Equipment from '@/pages/Equipment';
import MyRentals from '@/pages/MyRentals';

import DashboardHome from '@/pages/dashboard/DashboardHome';
import AdminEquipment from '@/pages/dashboard/AdminEquipment';
import AdminRentals from '@/pages/dashboard/AdminRentals';
import AdminUsers from '@/pages/dashboard/AdminUsers';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/equipment" element={<Equipment />} />
          <Route path="/my-rentals" element={<MyRentals />} />

          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/dashboard/equipment" element={<AdminEquipment />} />
          <Route path="/dashboard/rentals" element={<AdminRentals />} />
          <Route path="/dashboard/users" element={<AdminUsers />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

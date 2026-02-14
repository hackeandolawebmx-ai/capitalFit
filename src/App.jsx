import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/client/Login';
import Status from './pages/client/Status';
import Renewal from './pages/client/Renewal';
import Profile from './pages/client/Profile';
import Dashboard from './pages/admin/Dashboard';
import Clients from './pages/admin/Clients';
import Payments from './pages/admin/Payments';
import Rentability from './pages/admin/Rentability';
import Plans from './pages/admin/Plans';
import ClientDetail from './pages/admin/ClientDetail';
import AdminLayout from './components/AdminLayout';

import AdminLogin from './pages/admin/Login';
import RequireAuth from './components/RequireAuth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Client Routes */}
        <Route path="/mi-membresia" element={<Login />} />
        <Route path="/mi-membresia/estatus" element={<Status />} />
        <Route path="/mi-membresia/renovar" element={<Renewal />} />
        <Route path="/mi-membresia/perfil" element={<Profile />} />

        {/* Admin Public Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Protected Routes */}
        <Route element={<RequireAuth />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clientes" element={<Clients />} />
            <Route path="clientes/:id" element={<ClientDetail />} />
            <Route path="pagos" element={<Payments />} />
            <Route path="rentabilidad" element={<Rentability />} />
            <Route path="planes" element={<Plans />} />
          </Route>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

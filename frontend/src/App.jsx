import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";

// Sayfa bileşenlerini import et
import HomePage from './pages/HomePage';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfileSettings from './pages/ProfileSettings';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminRegisterPage from './pages/AdminRegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminSettings from './pages/AdminSettings';

// CSS dosyalarını import et
import './css/HomePage.css';
import './css/LoginPage.css';
import './css/MainPage.css';
import './css/ProfileSettings.css';
import './css/RegisterPage.css';
import './App.css';

// Korumalı Route bileşeni - Normal kullanıcılar için
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Korumalı Route bileşeni - Admin kullanıcılar için
const AdminProtectedRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin Public Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/register" element={<AdminRegisterPage />} />

        {/* Protected Routes - Normal Users */}
        <Route path="/home" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfileSettings />
          </ProtectedRoute>
        } />

        {/* Protected Routes - Admin Users */}
        <Route path="/admin/dashboard" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <AdminProtectedRoute>
            <AdminSettings />
          </AdminProtectedRoute>
        } />

        {/* 404 - Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
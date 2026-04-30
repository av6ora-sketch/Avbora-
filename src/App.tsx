/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import About from './pages/About';
import Terms from './pages/Terms';
import Pricing from './pages/Pricing';
import Articles from './pages/Articles';
import BlogSettings from './pages/BlogSettings';
import Media from './pages/Media';
import Support from './pages/Support';
import Profile from './pages/Profile';
import { AdminRoute } from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';
import AdminUsers from './pages/admin/AdminUsers';
import AdminArticles from './pages/admin/AdminArticles';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSupport from './pages/admin/AdminSupport';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/pricing" element={<Pricing />} />
          
          {/* Protected Onboarding */}
          <Route
            path="/setup"
            element={
              <ProtectedRoute>
                <Setup />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute requireProfile><AdminRoute><AdminLayout /></AdminRoute></ProtectedRoute>}>
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/articles" element={<AdminArticles />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/support" element={<AdminSupport />} />
          </Route>

          {/* Protected Main App */}
          <Route element={<ProtectedRoute requireProfile><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/blog-settings" element={<BlogSettings />} />
            <Route path="/media" element={<Media />} />
            <Route path="/support" element={<Support />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </LanguageProvider>
  );
}

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { lazy, Suspense } from 'react';


export default function App() {

  const ProductListPage = lazy(() => import('./pages/ProductListPage'));
  const ProductFormPage = lazy(() => import('./pages/ProductFormPage'));
  const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <AuthProvider>
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
          }
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/products" element={<ProductListPage />} />
                <Route path="/products/new" element={<ProductFormPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/products/:id/edit" element={<ProductFormPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/products" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
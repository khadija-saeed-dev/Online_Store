import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminProtectedRoute from './components/AdminProtectedRoute.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import AddProduct from './pages/AddProduct.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EditProduct from './pages/EditProduct.jsx';
import Login from './pages/Login.jsx';
import Products from './pages/Products.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import { AdminAuthProvider } from './context/AdminAuthContext.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          <Route element={<Login />} path="/login" />
          <Route element={<AdminProtectedRoute />}>
            <Route element={<AdminLayout />} path="/">
              <Route element={<Navigate replace to="/dashboard" />} index />
              <Route element={<Dashboard />} path="dashboard" />
              <Route element={<Products />} path="products" />
              <Route element={<AddProduct />} path="products/add" />
              <Route element={<EditProduct />} path="products/edit/:id" />
              <Route element={<PlaceholderPage description="Order management will be available here." title="Orders" />} path="orders" />
              <Route element={<PlaceholderPage description="Customer account management will be available here." title="Users" />} path="users" />
              <Route element={<PlaceholderPage description="Store preferences will be available here." title="Settings" />} path="settings" />
              <Route element={<Navigate replace to="/dashboard" />} path="*" />
            </Route>
          </Route>
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
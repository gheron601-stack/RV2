import { createBrowserRouter, Navigate } from 'react-router';
import { useAuth } from './lib/auth';
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';
import Landing from './pages/Landing';
import Pending from './pages/Pending';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import AboutUs from './pages/AboutUs';
import Orders from './pages/Orders';
import Invoice from './pages/Invoice';
import Profile from './pages/Profile';
import Dashboard from './pages/admin/Dashboard';
import OrdersList from './pages/admin/OrdersList';
import OrderDetail from './pages/admin/OrderDetail';
import Products from './pages/admin/Products';
import Customers from './pages/admin/Customers';
import Settings from './pages/admin/Settings';
import Reports from './pages/admin/Reports';

function Spinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="relative">
        <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-b-accent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }} />
      </div>
    </div>
  );
}

function AuthRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Landing />;
  if (user.is_admin) return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/catalog" replace />;
}

function CustomerGuard() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/" replace />;
  if (user.is_admin) return <Navigate to="/admin/dashboard" replace />;
  return <CustomerLayout />;
}

function AdminGuard() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user || !user.is_admin) return <Navigate to="/" replace />;
  return <AdminLayout />;
}

export const router = createBrowserRouter([
  { path: '/', element: <AuthRedirect /> },
  {
    element: <CustomerGuard />,
    children: [
      { path: '/catalog', element: <Catalog /> },
      { path: '/catalog/:id', element: <ProductDetail /> },
      { path: '/about', element: <AboutUs /> },
      { path: '/cart', element: <Cart /> },
      { path: '/checkout', element: <Checkout /> },
      { path: '/orders', element: <Orders /> },
      { path: '/orders/:id/invoice', element: <Invoice /> },
      { path: '/profile', element: <Profile /> },
      { path: '/payment', element: <Payment /> },
      { path: '/orders/:orderId/payment', element: <Payment /> },
    ],
  },
  {
    element: <AdminGuard />,
    children: [
      { path: '/admin', element: <Navigate to="/admin/dashboard" replace /> },
      { path: '/admin/dashboard', element: <Dashboard /> },
      { path: '/admin/orders', element: <OrdersList /> },
      { path: '/admin/orders/:id', element: <OrderDetail /> },
      { path: '/admin/products', element: <Products /> },
      { path: '/admin/customers', element: <Customers /> },
      { path: '/admin/settings', element: <Settings /> },
      { path: '/admin/reports', element: <Reports /> },
    ],
  },
]);

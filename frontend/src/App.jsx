import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer.jsx';
import Navbar from './components/Navbar.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

const About = lazy(() => import('./pages/About.jsx'));
const Cart = lazy(() => import('./pages/Cart.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Home = lazy(() => import('./pages/Home.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const OrderDetails = lazy(() => import('./pages/OrderDetails.jsx'));
const Orders = lazy(() => import('./pages/Orders.jsx'));
const ProductDetails = lazy(() => import('./pages/ProductDetails.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Shop = lazy(() => import('./pages/Shop.jsx'));

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AuthProvider>
          <div className="flex min-h-screen flex-col bg-[#fbfaf7] text-[#203a31]">
            <Navbar />
            <main className="flex-1">
              <Suspense fallback={<div className="mx-auto max-w-7xl px-5 py-16 text-sm text-stone-500 sm:px-8" role="status">Loading page...</div>}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/products/:slug" element={<ProductDetails />} />
                  <Route path="/category/:slug" element={<Shop />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                  <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </CartProvider>
    </BrowserRouter>
  );
}
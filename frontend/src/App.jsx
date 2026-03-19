import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import CartPage from './pages/Cart';
import CheckoutPage from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import OrderDetail from './pages/OrderDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import Feature from './pages/Feature';
import NotFound from './pages/404';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Testimonial from './pages/Testimonial';
import ServicesPage from './pages/Service';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Login from './pages/Login';
import Register from './pages/Register';
import ScrollToTop from './components/ScrollToTop';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import ProductForm from './pages/admin/ProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';

function App() {

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          path="/login"
          element={
            <div className="app">
              <Login />
            </div>
          }
        />
        <Route
          path="/register"
          element={
            <div className="app">
              <Register />
            </div>
          }
        />
        <Route
          path="/cart"
          element={
            <div className="app">
              <Header />
              <CartPage />
              <Footer />
            </div>
          }
        />
        <Route
          path="/checkout"
          element={
            <div className="app">
              <Header />
              <CheckoutPage />
              <Footer />
            </div>
          }
        />
        <Route
          path="/my-orders"
          element={
            <div className="app">
              <Header />
              <MyOrders />
              <Footer />
            </div>
          }
        />
        <Route
          path="/services"
          element={
            <div className="app">
              <Header />
              <ServicesPage />
              <Footer />
            </div>
          }
        />
        <Route
          path="/terms-and-conditions"
          element={
            <div className="app">
              <Header />
              <TermsAndConditions />
              <Footer />
            </div>
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <div className="app">
              <Header />
              <PrivacyPolicy />
              <Footer />
            </div>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <div className="app">
              <Header />
              <OrderDetail />
              <Footer />
            </div>
          }
        />
        {/* Public Routes with Header/Footer */}
        <Route
          path="/"
          element={
            <div className="app">
              <Header />
              <Home />
              <Footer />
            </div>
          }
        />
        <Route
          path="/about"
          element={
            <div className="app">
              <Header />
              <About />
              <Footer />
            </div>
          }
        />
        <Route
          path="/contact"
          element={
            <div className="app">
              <Header />
              <Contact />
              <Footer />
            </div>
          }
        />
        <Route
          path="/blog"
          element={
            <div className="app">
              <Header />
              <Blog />
              <Footer />
            </div>
          }
        />
        <Route
          path="/feature"
          element={
            <div className="app">
              <Header />
              <Feature />
              <Footer />
            </div>
          }
        />
        <Route
          path="/404"
          element={
            <div className="app">
              <Header />
              <NotFound />
              <Footer />
            </div>
          }
        />
        <Route
          path="/products"
          element={
            <div className="app">
              <Header />
              <Products />
              <Footer />
            </div>
          }
        />
        <Route
          path="/products/:slug"
          element={
            <div className="app">
              <Header />
              <ProductDetails />
              <Footer />
            </div>
          }
        />
        <Route
          path="/testimonial"
          element={
            <div className="app">
              <Header />
              <Testimonial />
              <Footer />
            </div>
          }
        />

        {/* Admin Routes (No Header/Footer) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/products/new" element={<ProductForm />} />
        <Route path="/admin/products/edit/:id" element={<ProductForm />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
      </Routes>
    </>
  );
}

export default App;
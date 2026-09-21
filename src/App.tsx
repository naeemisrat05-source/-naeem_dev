import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/layout/Navbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { CategoryDrawer } from './components/layout/CategoryDrawer';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/common/Toast';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { AccountPage } from './pages/AccountPage';
import { AuthPage } from './pages/AuthPages';
import { StaticPage } from './pages/StaticPages';
import { AdminDashboard } from './pages/AdminDashboard';
import { Order } from './types';

function MainRouter() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [searchParams, setSearchParams] = useState<string>(() => {
    return window.location.search || '';
  });
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Synchronize with window browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setSearchParams(window.location.search || '');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (pathWithQuery: string) => {
    const [pathPart, queryPart] = pathWithQuery.split('?');
    window.history.pushState({}, '', pathWithQuery);
    setCurrentPath(pathPart || '/');
    setSearchParams(queryPart ? `?${queryPart}` : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Extract query parameters
  const query = new URLSearchParams(searchParams);
  const queryCategory = query.get('category') || undefined;
  const querySearch = query.get('q') || undefined;
  const queryOrderId = query.get('id') || undefined;

  // Route matching helper
  const renderRoute = () => {
    // 1. Home
    if (currentPath === '/' || currentPath === '/home') {
      return <HomePage onNavigate={navigate} />;
    }

    // 2. Shop Catalog
    if (currentPath === '/shop') {
      return (
        <ShopPage
          initialCategory={queryCategory}
          initialSearch={querySearch}
          onNavigate={navigate}
        />
      );
    }

    // 3. Product Detail: /product/:id
    if (currentPath.startsWith('/product/')) {
      const productId = currentPath.replace('/product/', '');
      return <ProductDetailPage productId={productId} onNavigate={navigate} />;
    }

    // 4. Cart
    if (currentPath === '/cart') {
      return <CartPage onNavigate={navigate} />;
    }

    // 5. Checkout
    if (currentPath === '/checkout') {
      return (
        <CheckoutPage
          onNavigate={navigate}
          onOrderPlaced={(ord) => setPlacedOrder(ord)}
        />
      );
    }

    // 6. Order Success
    if (currentPath === '/order-success') {
      return <OrderSuccessPage order={placedOrder} onNavigate={navigate} />;
    }

    // 7. Track Order
    if (currentPath === '/track-order') {
      return <TrackOrderPage initialOrderId={queryOrderId} onNavigate={navigate} />;
    }

    // 8. Account & Sub-routes
    if (currentPath.startsWith('/account')) {
      let tab: 'dashboard' | 'orders' | 'addresses' | 'wishlist' | 'profile' = 'dashboard';
      if (currentPath.includes('/orders')) tab = 'orders';
      else if (currentPath.includes('/addresses')) tab = 'addresses';
      else if (currentPath.includes('/wishlist')) tab = 'wishlist';
      else if (currentPath.includes('/profile')) tab = 'profile';

      return <AccountPage initialTab={tab} onNavigate={navigate} />;
    }

    // 9. Auth
    if (currentPath === '/login') {
      return <AuthPage mode="login" onNavigate={navigate} />;
    }
    if (currentPath === '/register') {
      return <AuthPage mode="register" onNavigate={navigate} />;
    }

    // 10. Admin
    if (currentPath === '/admin') {
      return <AdminDashboard onNavigate={navigate} />;
    }

    // 11. Static Pages
    if (currentPath === '/about') {
      return <StaticPage type="about" onNavigate={navigate} />;
    }
    if (currentPath === '/contact') {
      return <StaticPage type="contact" onNavigate={navigate} />;
    }
    if (currentPath === '/faq') {
      return <StaticPage type="faq" onNavigate={navigate} />;
    }
    if (currentPath === '/privacy') {
      return <StaticPage type="privacy" onNavigate={navigate} />;
    }
    if (currentPath === '/terms') {
      return <StaticPage type="terms" onNavigate={navigate} />;
    }
    if (currentPath === '/returns') {
      return <StaticPage type="returns" onNavigate={navigate} />;
    }

    // Fallback: Default to Home
    return <HomePage onNavigate={navigate} />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 selection:bg-teal-600 selection:text-white pb-16 md:pb-0">
      {/* Global Navbar */}
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenCategoryDrawer={() => setIsCategoryDrawerOpen(true)}
      />

      {/* Main Page Body */}
      <main className="flex-1 w-full pt-4">
        {renderRoute()}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={navigate} />

      {/* Mobile Sticky Navigation */}
      <MobileBottomNav
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenCategoryDrawer={() => setIsCategoryDrawerOpen(true)}
      />

      {/* Category Sliding Drawer */}
      <CategoryDrawer
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
        onNavigate={navigate}
      />

      {/* Floating Real-time Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <MainRouter />
      </StoreProvider>
    </AuthProvider>
  );
}

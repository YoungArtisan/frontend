import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ArtistLayout from './components/layout/ArtistLayout';
import ArtistDashboard from './pages/artist/ArtistDashboard';
import ArtistMessagesPage from './pages/artist/ArtistMessagesPage';
import ArtistProductsPage from './pages/artist/ArtistProductsPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import { ChatProvider } from './context/ChatContext';
import { AuthProvider } from './context/AuthContext';
import { seedProducts } from './firebase/seed';

function App() {
  useEffect(() => {
    // Seed products only if needed
    seedProducts();
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <ChatProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/order-confirmation" element={<OrderSuccessPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* Protected Checkout Route */}
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                } />

                {/* Artist Dashboard Routes */}
                <Route path="/artist" element={
                  <ProtectedRoute requiredRole="artist">
                    <ArtistLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<ArtistDashboard />} />
                  <Route path="messages" element={<ArtistMessagesPage />} />
                  <Route path="products" element={<ArtistProductsPage />} />
                </Route>
              </Routes>
            </div>
          </Router>
        </ChatProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

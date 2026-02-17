import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ArtistLayout from './components/layout/ArtistLayout';
import ArtistDashboard from './pages/artist/ArtistDashboard';
import ArtistMessagesPage from './pages/artist/ArtistMessagesPage';
import { CartProvider } from './context/CartContext';
import { ChatProvider } from './context/ChatContext';

function App() {
  return (
    <CartProvider>
      <ChatProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation" element={<OrderSuccessPage />} />

              {/* Artist Dashboard Routes */}
              <Route path="/artist" element={<ArtistLayout />}>
                <Route index element={<ArtistDashboard />} />
                <Route path="messages" element={<ArtistMessagesPage />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </ChatProvider>
    </CartProvider>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { PlanProvider } from './contexts/PlanContext';
import ProtectedRoute from './components/ProtectedRoute';
import SlideCart from './components/cart/SlideCart';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import Billing from './pages/Billing';
import BillingSuccess from './pages/BillingSuccess';
import BillingCancel from './pages/BillingCancel';
import CartSuccess from './pages/CartSuccess';

function App() {
  return (
    <AuthProvider>
      <PlanProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="min-h-screen">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/billing"
                  element={
                    <ProtectedRoute>
                      <Billing />
                    </ProtectedRoute>
                  }
                />              <Route path="/billing/success" element={<BillingSuccess />} />
              <Route path="/billing/cancel" element={<BillingCancel />} />
              <Route path="/cart/success" element={<CartSuccess />} />
            </Routes>
              <SlideCart />
            </div>
          </BrowserRouter>
        </CartProvider>
      </PlanProvider>
    </AuthProvider>
  );
}

export default App;

import React from 'react';
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CustomersPage from './pages/CustomersPage.jsx';
import CustomerDetailPage from './pages/CustomerDetailPage.jsx';
import CardsPage from './pages/CardsPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import TransactionDetailPage from './pages/TransactionDetailPage.jsx';
import NewPaymentPage from './pages/NewPaymentPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { clearAuth, getUser, isAuthed } from './auth.js';

function Shell({ children }) {
  const navigate = useNavigate();
  const user = getUser();

  const onLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">SP</div>
          <div className="brandText">
            <div className="brandName">ShieldPay</div>
            <div className="brandSub">Demo dashboard</div>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/dashboard" className="navItem">Dashboard</NavLink>
          <NavLink to="/customers" className="navItem">Customers</NavLink>
          <NavLink to="/cards" className="navItem">Cards</NavLink>
          <NavLink to="/transactions" className="navItem">Transactions</NavLink>
          <NavLink to="/payments/new" className="navItem">New payment</NavLink>
          <NavLink to="/admin" className="navItem">Admin</NavLink>
          <NavLink to="/settings" className="navItem">Settings</NavLink>
        </nav>

        <div className="sidebarFooter">
          <div className="userChip">
            <div className="userName">{user?.name || '—'}</div>
            <div className="userMeta">{user?.email || ''} {user?.role ? `· ${user.role}` : ''}</div>
          </div>
          <button className="btn btnGhost" onClick={onLogout}>Log out</button>
          <div className="hint">One origin: {window.location.origin}</div>
        </div>
      </aside>

      <main className="main">
        {children}
      </main>
    </div>
  );
}

function RequireAuth({ children }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <Shell>
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/customers/:id" element={<CustomerDetailPage />} />
                <Route path="/cards" element={<CardsPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/transactions/:id" element={<TransactionDetailPage />} />
                <Route path="/payments/new" element={<NewPaymentPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<DashboardPage />} />
              </Routes>
            </Shell>
          </RequireAuth>
        }
      />
    </Routes>
  );
}


import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage.js';
import Login from './components/Login.js';
import Register from './components/Register.js';
import AdminProducts from './components/AdminProducts.js';
import DashboardPage from './pages/DashboardPage.js'; // ✅ Add this
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/dashboard" element={<DashboardPage />} /> {/* ✅ New Route */}
      </Routes>
    </Router>
  );
}

export default App;

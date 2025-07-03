import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const sendKeyToEmail = (email, key) => {
  // This is a placeholder for sending email. In a real app, call your backend here.
  alert(`Admin key for ${email} is: ${key}\n(This would be sent to the email in a real app.)`);
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !adminKey) {
      setError('Please enter email, password, and admin key.');
      return;
    }
    try {
      const res = await fetch('http://localhost:8000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, key: adminKey })
      });
      if (res.ok) {
        setError('');
        localStorage.setItem('isAdminLoggedIn', 'true');
        navigate('/');
        window.location.reload();
      } else {
        const data = await res.json();
        setError(data.detail || 'Invalid credentials or admin key.');
        setShowRegister(true);
      }
    } catch (err) {
      setError('Could not connect to backend.');
    }
  };

  const handleForgotKey = () => {
    setError('Contact your system administrator to recover your key.');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">Admin Key</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Login
          </button>
        </form>
        <button
          type="button"
          className="mt-4 w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition-colors"
          onClick={handleForgotKey}
        >
          Forgot Admin Key?
        </button>
        {showRegister && (
          <button
            type="button"
            className="mt-4 w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors"
            onClick={() => navigate('/register')}
          >
            Register as New Admin
          </button>
        )}
      </div>
    </div>
  );
};

export default Login;

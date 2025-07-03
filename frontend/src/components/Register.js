import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function generateAdminKey() {
  return Math.random().toString(36).substr(2, 10).toUpperCase();
}

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      setSuccess('');
      setAdminKey('');
      return;
    }
    const key = generateAdminKey();
    setAdminKey(key);
    setError('');
    setSuccess('Registration successful! Your admin key is shown below.');
    // Send registration to backend
    try {
      const res = await fetch('http://localhost:8000/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, key })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || 'Registration failed.');
        setSuccess('');
        return;
      }
      // Redirect to login after showing admin key for 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError('Could not connect to backend.');
      setSuccess('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Register</h2>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        {success && <div className="mb-4 text-green-500">{success}</div>}
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
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors"
          >
            Register
          </button>
        </form>
        {adminKey && (
          <div className="mt-4 p-4 bg-yellow-100 text-yellow-800 rounded">
            <strong>Save this admin key:</strong> {adminKey}
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;

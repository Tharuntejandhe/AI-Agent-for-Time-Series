import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
  return (
    <header className="w-full flex items-center justify-between p-4 bg-white shadow">
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-800">
        Walmart Admin Page
      </h1>
      <div className="flex space-x-4">
        {!isLoggedIn && (
          <>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
            >
              Admin Register
            </button>
          </>
        )}
        {isLoggedIn && (
          <button
            onClick={() => {
              localStorage.removeItem('isAdminLoggedIn');
              navigate('/');
              window.location.reload();
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
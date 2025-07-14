import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/');
    window.location.reload();
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="relative z-50 p-4 bg-black/40 backdrop-blur-md shadow-md border-b border-white/10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Walmart Admin
        </h1>

        <div className="flex items-center space-x-4">
          {!isLoggedIn ? (
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
          ) : (
            <div className="relative" ref={dropdownRef}>
              <img
                src="https://img.icons8.com/ios-filled/50/admin-settings-male.png"
                alt="Admin Logo"
                className="w-8 h-8 cursor-pointer filter invert"
                title="Admin Menu"
                onClick={() => setShowDropdown((prev) => !prev)}
              />

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-32 bg-black/60 backdrop-blur-lg border border-white/20 rounded-md shadow-lg z-50">
                  <button
                    onClick={() => {
                      navigate('/admin-details');
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-white/10"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-400 hover:bg-white/10"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Optional: subtle bottom fade line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </header>
  );
}

export default Header;
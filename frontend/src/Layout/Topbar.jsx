
import React from 'react';

const Topbar = () => {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h2 className="text-lg font-semibold">Admin Panel</h2>
      <div className="relative">
        <button className="text-blue-700 hover:text-blue-900">Profile ▼</button>
      </div>
    </header>
  );
};

export default Topbar;

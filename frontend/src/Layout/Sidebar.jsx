
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="w-64 bg-white shadow-lg p-4">
      <h1 className="text-xl font-bold mb-6">Sales Dashboard</h1>
      <nav className="flex flex-col space-y-4">
        <Link to="/" className="text-blue-700 hover:text-blue-900">Dashboard</Link>
        <Link to="/products" className="text-blue-700 hover:text-blue-900">Products</Link>
        <Link to="/users" className="text-blue-700 hover:text-blue-900">Users</Link>
      </nav>
    </div>
  );
};

export default Sidebar;

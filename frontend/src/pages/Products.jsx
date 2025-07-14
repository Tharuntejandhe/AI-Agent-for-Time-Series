
import React from 'react';

const Products = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Product Management</h2>
      <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl">
        <span>+</span>
        <span>Add Product</span>
      </button>
      <div className="mt-6 bg-white rounded-xl shadow-md p-4">Product Table Here</div>
    </div>
  );
};

export default Products;

import React, { useState } from 'react';

function ProductForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    productId: '',
    image: '',
    stock: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for the field being edited
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.productId.trim()) newErrors.productId = 'Product ID is required';
    if (!formData.image.trim()) newErrors.image = 'Image URL is required';
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Valid stock quantity is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
      setFormData({ name: '', productId: '', image: '', stock: '' }); // Reset form
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md min-h-[400px] flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-4 text-center">Add New Product</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 pl-2">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.name ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 h-10 text-base`}
            placeholder="Enter product name"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 pl-2">Product ID</label>
          <input
            type="text"
            name="productId"
            value={formData.productId}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.productId ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 h-10 text-base`}
            placeholder="Enter product ID"
          />
          {errors.productId && <p className="text-red-500 text-sm mt-1">{errors.productId}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 pl-2">Image URL</label>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.image ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 h-10 text-base`}
            placeholder="Enter image URL"
          />
          {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 pl-2">Stocks Available</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.stock ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 h-10 text-base`}
            placeholder="Enter stock quantity"
            min="0"
          />
          {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductForm;
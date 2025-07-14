import React, { useState, useEffect } from 'react';

function ProductForm({ onSubmit, onCancel }) {
  const getToday = () => new Date().toISOString().slice(0, 10);

  const [formData, setFormData] = useState({
    name: '',
    productId: '',
    image: '',
    stock: '',
    manufactureDate: '',
    expiryDate: '',
    normalDate: getToday(),
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData((prev) => ({ ...prev, normalDate: getToday() }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.productId.trim()) newErrors.productId = 'Product ID is required';
    if (!formData.image.trim()) newErrors.image = 'Image URL is required';
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Valid stock quantity is required';
    if (!formData.manufactureDate) newErrors.manufactureDate = 'Manufacture date is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await fetch('http://localhost:8000/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Failed to add product.');

        const newProduct = await response.json();
        onSubmit(newProduct); // Send product to HomePage to update list
        setFormData({
          name: '',
          productId: '',
          image: '',
          stock: '',
          manufactureDate: '',
          expiryDate: '',
          normalDate: getToday(),
        });
      } catch (error) {
        alert('Error adding product: ' + error.message);
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md min-h-[400px] flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-4 text-center text-black">Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4 text-black">
        {[
          { label: 'Product Name', name: 'name', type: 'text', placeholder: 'Enter product name' },
          { label: 'Product ID', name: 'productId', type: 'text', placeholder: 'Enter product ID' },
          { label: 'Image URL', name: 'image', type: 'text', placeholder: 'Enter image URL' },
          { label: 'Stocks Available', name: 'stock', type: 'number', placeholder: 'Enter stock quantity', min: 0 },
          { label: 'Manufacture Date', name: 'manufactureDate', type: 'date' },
          { label: 'Expiry Date', name: 'expiryDate', type: 'date' },
        ].map(({ label, name, type, placeholder, min }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 pl-2">{label}</label>
            <input
              type={type}
              name={name}
              min={min}
              value={formData[name]}
              onChange={handleChange}
              placeholder={placeholder}
              className={`mt-1 block w-full rounded-md border ${errors[name] ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 h-10 text-base`}
            />
            {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]}</p>}
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700 pl-2">Normal Date</label>
          <input
            type="date"
            name="normalDate"
            value={formData.normalDate}
            readOnly
            disabled
            className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 shadow-sm h-10 text-base cursor-not-allowed"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
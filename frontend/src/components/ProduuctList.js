import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/products');
        console.log('Fetched products from API:', response.data);
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products.');
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleToggle = (productId) => {
    setExpandedCard(expandedCard === productId ? null : productId);
  };

  const handleAddToCart = async (productId) => {
    try {
      const response = await axios.post('http://localhost:8000/api/cart', {
        productId,
        quantity: 1,
      });
      alert(response.data.message);
    } catch (err) {
      alert('Failed to add to cart');
    }
  };

  if (loading) return <div className="text-center text-white py-4">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {products.length === 0 ? (
        <div className="text-center col-span-full text-white">No products available.</div>
      ) : (
        products.map((product) => (
          <ProductCard
            key={product.id}
            image={product.image}
            name={product.name}
            productId={product.id}
            stock={product.stock}
            normalDate={product.normalDate}
            expiryDate={product.expiryDate}
            isExpanded={expandedCard === product.id}
            onToggle={() => handleToggle(product.id)}
            onAddToCart={() => handleAddToCart(product.id)}
          />
        ))
      )}
    </div>
  );
}

export default ProductList;
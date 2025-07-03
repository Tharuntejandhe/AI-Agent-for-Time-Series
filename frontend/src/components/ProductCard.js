import React, { useState } from 'react';

function ProductCard({ image, name, productId, stock }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDetails = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 w-64 mx-auto my-4 cursor-pointer hover:shadow-lg transition"
      onClick={toggleDetails}
    >
      <img src={image} alt={name} className="w-full h-40 object-cover rounded-md mb-2" />
      <h3 className="text-lg font-semibold text-center">{name}</h3>
      {isExpanded && (
        <div className="mt-2 text-sm text-gray-600 text-center">
          <p>Product ID: {productId}</p>
          <p>Stock: {stock}</p>
        </div>
      )}
    </div>
  );
}

export default ProductCard;
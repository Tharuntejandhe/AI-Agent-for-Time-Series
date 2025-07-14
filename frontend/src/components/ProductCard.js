import React from 'react';

function ProductCard({
  image,
  name,
  productId,
  stock,
  normalDate,
  expiryDate,
  isExpanded,
  onToggle,
  onAddToCart
}) {
  const calculateDaysLeft = (normal, expiry) => {
    const currentDate = new Date();
    try {
      const expiryDateObj = new Date(expiry);
      const diffTime = expiryDateObj - currentDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 ? diffDays : 'Expired';
    } catch {
      return 'Unknown';
    }
  };

  const getUrgencyColor = (score) => {
    return score >= 70 ? 'text-red-600' : 'text-green-600';
  };

  const getDaysLeftColor = (daysLeft) => {
    if (typeof daysLeft !== 'number') return 'text-gray-500';
    if (daysLeft > 50) return 'text-green-600';
    if (daysLeft > 20) return 'text-yellow-500';
    return 'text-red-600';
  };

  const getUnitsColor = (units) => {
    if (typeof units !== 'number') return 'text-gray-500';
    if (units >= 50) return 'text-green-600';
    if (units >= 20) return 'text-yellow-500';
    return 'text-red-600';
  };

  const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const baseValue = hashString(productId ?? name ?? 'default');
  const randomPrice = (5 + (baseValue % 4500) / 100).toFixed(2);
  const randomDiscount = 5 + (baseValue % 26);

  const daysLeft = calculateDaysLeft(normalDate, expiryDate);
  const urgencyScore =
    daysLeft === 'Unknown' || daysLeft === 'Expired'
      ? 0
      : daysLeft <= 7
      ? 90
      : daysLeft <= 14
      ? 70
      : daysLeft <= 30
      ? 50
      : 20;

  const imageUrl = image?.startsWith('http') ? image : `http://localhost:8000/${image}`;

  return (
    <div className="bg-white text-black rounded-2xl shadow-lg overflow-hidden transition-transform duration-200 hover:scale-105">
      <img src={imageUrl} alt={name} className="w-full h-40 object-cover" />

      <div className="p-4 space-y-2">
        <h3 className="text-lg font-bold text-center truncate">{name}</h3>

        <p className="text-sm text-green-600 font-semibold">
          Price: ${randomPrice}
        </p>

        <p className={`text-sm flex items-center gap-1 font-medium ${getUnitsColor(stock)}`}>
          <i className="fa-solid fa-box"></i> Units: {stock ?? 'N/A'}
        </p>

        <p className="text-sm flex items-center gap-1 text-gray-700">
          <i className="fa-regular fa-calendar"></i> Days Left:
          <span className={`ml-1 font-medium ${getDaysLeftColor(daysLeft)}`}>
            {daysLeft}
          </span>
        </p>

        <p className={`text-sm font-medium ${getUrgencyColor(urgencyScore)}`}>
          Urgency Score: {urgencyScore}%
        </p>

        <p className="text-sm text-blue-600 font-medium">
          Estimated Discount: {randomDiscount}%
        </p>

        <button
          className={`w-full mt-3 py-2 rounded-xl flex justify-center items-center gap-2 text-white ${
            stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (stock > 0) onAddToCart();
          }}
          disabled={stock === 0}
        >
          <i className="fa-solid fa-cart-shopping"></i>{' '}
          {stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
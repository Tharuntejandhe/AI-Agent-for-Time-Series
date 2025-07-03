import React from 'react';

function PlusButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-purple-500 text-white w-16 h-16 flex items-center justify-center rounded-full hover:bg-purple-600 transition text-2xl shadow-lg"
    >
      +
    </button>
  );
}

export default PlusButton;
import React, { useState, useEffect } from 'react';
    import Header from '../components/Header.js';
    import PlusButton from '../components/PlusButton.js';
    import ProductCard from '../components/ProductCard.js';
    import ProductForm from '../components/ProductForm.js';
    import Login from '../components/Login.js';
    import { FaEdit } from "react-icons/fa";
    
    const API_URL = 'http://localhost:8000/api/products';
    
    function HomePage() {
      const [cards, setCards] = useState([]);
      const [showForm, setShowForm] = useState(false);
      const [error, setError] = useState("");
      const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    
      useEffect(() => {
        fetch(API_URL)
          .then((res) => res.json())
          .then((data) => setCards(data))
          .catch(() => setError("Failed to fetch products."));
      }, []);
    
      const addCard = async (product) => {
        setError("");
        try {
          const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: product.name,
              productId: product.productId,
              image: product.image,
              stock: Number(product.stock)
            })
          });
          if (res.ok) {
            const added = await res.json();
            setCards([...cards, added]);
            setShowForm(false);
          } else {
            setError("Failed to add product.");
          }
        } catch {
          setError("Failed to add product.");
        }
      };
    
      const toggleForm = () => {
        setShowForm(!showForm);
      };
    
      return (
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <div className="flex-grow container mx-auto px-4 py-8">
            {/* <h1 className="text-4xl font-extrabold tracking-tight text-gray-800 mb-8">Walmart Admin Page</h1> */}
            {showForm && isLoggedIn && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <ProductForm onSubmit={addCard} onCancel={toggleForm} />
              </div>
            )}
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {isLoggedIn ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-6">
                  {cards.map((card) => (
                    <ProductCard
                      key={card.id}
                      image={card.image}
                      name={card.name}
                      productId={card.productId}
                      stock={card.stock}
                    />
                  ))}
                </div>
                {/* Floating action buttons in bottom right */}
                <div className="fixed bottom-8 right-8 flex flex-col items-end gap-4 z-50">
                  <button
                    className="bg-blue-600 text-white w-16 h-16 flex items-center justify-center rounded-full shadow hover:bg-blue-700 transition-colors text-2xl mb-2"
                    onClick={() => window.location.href = '/admin/products'}
                    aria-label="Update Products"
                  >
                    <FaEdit />
                  </button>
                  <PlusButton onClick={toggleForm} />
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 mt-10 text-xl font-semibold">Please log in as admin to view and manage products.</div>
            )}
          </div>
        </div>
      );
    }
    
    export default HomePage;
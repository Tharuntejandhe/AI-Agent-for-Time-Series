import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.js';
import ProductCard from '../components/ProductCard.js';
import ProductForm from '../components/ProductForm.js';
import Suggestions from '../components/Suggestions.js';
import { FaBoxOpen } from 'react-icons/fa';

const API_URL = 'http://localhost:8000/api/products';


function HomePage() {
  const [cards, setCards] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [sortCriteria, setSortCriteria] = useState('');
  const [filterCriteria, setFilterCriteria] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
  const suggestionPopupRef = useRef(null);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        const enriched = data.map((product) => {
          const daysLeft = calculateDaysLeft(product.normalDate, product.expiryDate);
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
          const discount = getFixedDiscount(product.productId);
          const price = getFixedPrice(product.productId);

          return {
            ...product,
            urgencyScore,
            discount,
            price,
          };
        });
        setCards(enriched);
      })
      .catch(() => setError('Failed to fetch products.'));
  }, []);

  const toggleForm = () => {
    const next = !showForm;
    setShowForm(next);
    if (next) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addCard = async (product) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      if (res.ok) {
        const newProduct = await res.json();
        setCards([...cards, newProduct]);
        setShowForm(false);
      } else {
        setError('Failed to add product.');
      }
    } catch {
      setError('Error adding product.');
    }
  };

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

  const getFixedPrice = (productId) => {
    const seed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (5 + (seed % 45)).toFixed(2);
  };

  const getFixedDiscount = (productId) => {
    const seed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 5 + (seed % 26);
  };

  const handleSort = (criteria) => {
    setSortCriteria(criteria);
    setShowSortOptions(false);
  };

  const handleFilter = (criteria) => {
    setFilterCriteria(criteria);
    setShowFilterOptions(false);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setFilterCriteria('category');
    setShowCategoryDropdown(false);
    setShowFilterOptions(false);
  };

  const getSortedCards = () => {
    let filtered = [...cards];

    if (filterCriteria === 'category' && selectedCategory) {
      filtered = filtered.filter((card) =>
        card.category &&
        card.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase()
      );
    }

    if (filterCriteria === 'discounted') {
      filtered = filtered.filter((card) => card.discount > 0);
    }

    if (filterCriteria === 'urgent') {
      filtered = filtered.filter((card) => card.urgencyScore >= 70);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter((card) =>
        card.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortCriteria === 'urgency') {
      filtered.sort((a, b) => b.urgencyScore - a.urgencyScore);
    } else if (sortCriteria === 'discount') {
      filtered.sort((a, b) => b.discount - a.discount);
    } else if (sortCriteria === 'units') {
      filtered.sort((a, b) => a.stock - b.stock);
    }

    return filtered;
  };

  const scrollToSuggestionPopup = () => {
    setShowSuggestions(true);
    setTimeout(() => {
      if (suggestionPopupRef.current) {
        suggestionPopupRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-white" style={{ filter: 'brightness(1.05) contrast(1.05)' }}>
      <Header />

      <div className="relative h-screen bg-cover bg-center flex flex-col items-center justify-center text-center pt-24" style={{ backgroundImage: "url('/assets/warehouse.jpg.webp')" }}>
        <div className="p-6 rounded-md z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-snug" style={{ fontFamily: 'Gotu, sans-serif' }}>
            Predict. Plan. Prosper. Empower <br /> your inventory decisions with <br /> AI-driven insights.
          </h1>
          <button onClick={() => navigate('/dashboard')} className="mt-4 bg-white text-black px-8 py-4 rounded-full font-bold text-xl hover:bg-gray-200 transition">
            Dashboard
          </button>
          <div className="mt-4">
            <i className="fa-solid fa-chevron-up text-2xl text-gray-300"></i>
          </div>
          <p className="text-sm mt-2 text-gray-200">Go to dashboard for detailed analysis</p>
        </div>
        <a href="#products" className="absolute bottom-4 z-10 flex flex-col items-center text-white animate-bounce">
          <FaBoxOpen className="text-2xl mb-1" />
          <span className="text-sm mb-1">Scroll down to view products</span>
          <i className="fa-solid fa-angles-down text-2xl"></i>
        </a>
        <div className="absolute inset-0 bg-black opacity-40"></div>
      </div>

      <section className="bg-gradient-to-b from-black to-blue-950 py-12 px-4 text-white" id="products">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center mb-8 gap-y-4 gap-x-6">
            <h2 className="text-4xl font-bold" style={{ fontFamily: 'Gotu, sans-serif' }}>Products</h2>
            <div className="flex flex-wrap items-center gap-4 ml-auto">
              {isLoggedIn && (
                <>
                  <button onClick={toggleForm} className="bg-white text-black px-5 py-2 rounded-xl text-sm font-medium flex items-center hover:bg-gray-100 transition">
                    Add <i className="fa-solid fa-plus ml-2"></i>
                  </button>
                  <button onClick={() => navigate('/admin/products')} className="bg-white text-black px-5 py-2 rounded-xl text-sm font-medium flex items-center hover:bg-gray-100 transition">
                    Edit <i className="fa-solid fa-pen-to-square ml-2"></i>
                  </button>
                </>
              )}

              <div className="relative">
                <button onClick={() => {
                  setShowSortOptions(!showSortOptions);
                  setShowFilterOptions(false);
                }} className="bg-white text-black px-5 py-2 rounded-xl text-sm font-medium flex items-center hover:bg-gray-100 transition">
                  Sort By <i className="fa-solid fa-angle-down ml-2"></i>
                </button>
                {showSortOptions && (
                  <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-lg shadow-lg z-50">
                    <button onClick={() => handleSort('urgency')} className="w-full px-4 py-2 hover:bg-gray-200 text-left">Urgency</button>
                    <button onClick={() => handleSort('discount')} className="w-full px-4 py-2 hover:bg-gray-200 text-left">Discount</button>
                    <button onClick={() => handleSort('units')} className="w-full px-4 py-2 hover:bg-gray-200 text-left">Units</button>
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={() => {
                  setShowFilterOptions(!showFilterOptions);
                  setShowSortOptions(false);
                }} className="bg-white text-black px-5 py-2 rounded-xl text-sm font-medium flex items-center hover:bg-gray-100 transition">
                  Filter By <i className="fa-solid fa-angles-down ml-2"></i>
                </button>
                {showFilterOptions && (
                  <div className="absolute right-0 mt-2 w-52 bg-white text-black rounded-lg shadow-lg z-50">
                    <div className="w-full px-4 py-2 hover:bg-gray-200 text-left cursor-pointer relative" onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}>
                      Category
                      {showCategoryDropdown && (
                        <div className="absolute left-full top-0 ml-2 w-48 bg-white text-black rounded-lg shadow-lg z-50" onClick={(e) => e.stopPropagation()}>
                          {['Electronics', 'Toys', 'Comics', 'Clothing'].map((cat) => (
                            <button
                              key={cat}
                              onClick={() => handleCategoryFilter(cat)}
                              className="w-full px-4 py-2 hover:bg-gray-200 text-left flex items-center justify-between"
                            >
                              <span>{cat}</span>
                              {selectedCategory === cat ? (
                                <i className="fa-solid fa-circle-check text-green-500"></i>
                              ) : (
                                <i className="fa-regular fa-circle text-gray-400"></i>
                              )}
                            </button>
                          ))}
                          <button
                            onClick={() => {
                              setSelectedCategory('');
                              setShowCategoryDropdown(false);
                            }}
                            className="w-full px-4 py-2 hover:bg-gray-100 text-left text-red-500"
                          >
                            Clear Selection
                          </button>
                        </div>
                      )}
                    </div>
                    <button onClick={() => handleFilter('discounted')} className="w-full px-4 py-2 hover:bg-gray-200 text-left">Discounted Products</button>
                    <button onClick={() => handleFilter('urgent')} className="w-full px-4 py-2 hover:bg-gray-200 text-left">Urgent Products</button>
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="Search products here"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-xl px-4 py-2 text-black placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring focus:ring-blue-400 focus:border-blue-400 transition w-64"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {getSortedCards().map((card, idx) => (
              <ProductCard
                key={card.id}
                image={card.image}
                name={card.name}
                productId={card.productId}
                stock={card.stock}
                normalDate={card.normalDate}
                expiryDate={card.expiryDate}
                isExpanded={expandedCard === idx}
                onToggle={() => setExpandedCard(expandedCard === idx ? null : idx)}
              />
            ))}
          </div>

          {/* AI Suggestions Section */}
          <div className="flex flex-col items-center justify-center mt-12 space-y-6 text-center">
            <form
              className="w-11/12 sm:w-4/5 md:w-2/3 lg:w-1/2 flex flex-col items-center"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!chatInput.trim()) return;
                setChatLoading(true);
                setChatResponse('');
                try {
                  const res = await fetch('http://localhost:8000/api/ai/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: chatInput })
                  });
                  const data = await res.json();
                  setChatResponse(data.response || 'No response from AI.');
                } catch (err) {
                  setChatResponse('Failed to get response from AI.');
                }
                setChatLoading(false);
              }}
            >
              <input
                type="text"
                placeholder="Chat with AI..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-lg"
                disabled={chatLoading}
              />
              <button
                type="submit"
                className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition"
                disabled={chatLoading}
              >
                {chatLoading ? 'Sending...' : 'Send'}
              </button>
            </form>
            {chatResponse && (
              <div className="w-11/12 sm:w-4/5 md:w-2/3 lg:w-1/2 mt-4 bg-gray-900 text-white rounded-lg p-4 shadow max-h-60 overflow-y-auto whitespace-pre-line text-left">
                {chatResponse}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-lg">
              <p className="text-gray-200 font-medium flex items-center">
                Click here to get AI Suggestions of the current products
                <i className="fa-solid fa-chevron-right ml-2 text-xl text-white"></i>
              </p>
              <button
                className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition flex items-center text-lg"
                onClick={scrollToSuggestionPopup}
              >
                Suggestions
                <i className="fa-solid fa-star-of-life ml-3"></i>
              </button>
            </div>
            <p className="text-gray-300 text-base mt-2">
              Analyze trends, predict demand, and make smarter stock decisions using AI
            </p>
          </div>
        </div>
      </section>

      {showSuggestions && (
        <div
          ref={suggestionPopupRef}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-4">
            <Suggestions />
            <div className="flex justify-end mt-4">
              <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400" onClick={() => setShowSuggestions(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && isLoggedIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto py-10">
          <ProductForm onSubmit={addCard} onCancel={toggleForm} />
        </div>
      )}
    </div>
  );
}

export default HomePage;
import React, { useState, useEffect } from 'react';


const API_URL = 'http://localhost:8000/api/products';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editStock, setEditStock] = useState('');
  const [editName, setEditName] = useState("");
  const [editProductId, setEditProductId] = useState("");

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  const handleDelete = (id) => {
    fetch(`${API_URL}/${id}`, { method: 'DELETE' }).then((res) => {
      if (res.ok) setProducts(products.filter((p) => p.id !== id));
    });
  };

  const handleEdit = (id, name, productId, image, stock) => {
    setEditId(id);
    setEditName(name);
    setEditProductId(productId);
    setEditStock(stock);
  };

  const handleSave = (id) => {
    const product = products.find((p) => p.id === id);
    fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editName,
        productId: editProductId,
        image: product.image,
        stock: Number(editStock)
      }),
    }).then((res) => {
      if (res.ok) {
        setProducts(
          products.map((p) =>
            p.id === id
              ? { ...p, name: editName, productId: editProductId, stock: editStock }
              : p
          )
        );
        setEditId(null);
        setEditName("");
        setEditProductId("");
        setEditStock("");
      }
    });
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Manage Products</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Name</th>
            <th className="p-2">Product ID</th>
            <th className="p-2">Stock</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-t">
              <td className="p-2">
                {editId === product.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="border px-2 py-1 rounded w-32"
                  />
                ) : (
                  product.name
                )}
              </td>
              <td className="p-2">
                {editId === product.id ? (
                  <input
                    type="text"
                    value={editProductId}
                    onChange={(e) => setEditProductId(e.target.value)}
                    className="border px-2 py-1 rounded w-24"
                  />
                ) : (
                  product.productId
                )}
              </td>
              <td className="p-2">
                {editId === product.id ? (
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="border px-2 py-1 rounded w-20"
                  />
                ) : (
                  product.stock
                )}
              </td>
              <td className="p-2 space-x-2">
                {editId === product.id ? (
                  <button
                    onClick={() => handleSave(product.id)}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => handleEdit(product.id, product.name, product.productId, product.image, product.stock)}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDelete(product.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {products.length === 0 && (
        <div className="text-center text-gray-500 mt-6">No products found.</div>
      )}
    </div>
  );
};

export default AdminProducts;

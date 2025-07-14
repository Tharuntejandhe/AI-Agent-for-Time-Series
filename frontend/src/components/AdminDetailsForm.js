import React, { useState, useEffect } from 'react';

const globalStyle = `
  body {
    background-color: #EFEEEA;
  }
  .identity-image {
    border-radius: 50%;
    width: 200px;
    height: 200px;
    object-fit: cover;
    position: fixed;
    top: 0px;
    right: 250px;
    border: 2px solid #ffffff;
    z-index: 999;
    background-color: white;
  }
`;

const AdminDetailsForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dob: '',
    address: '',
    identityProof: null,
  });

  const [existingEmail, setExistingEmail] = useState(null);
  const [isEditMode, setIsEditMode] = useState(true);
  const [identityPreview, setIdentityPreview] = useState(null);
  const [localImagePreview, setLocalImagePreview] = useState(null);

  const adminEmail = localStorage.getItem('adminEmail');

  useEffect(() => {
    if (!adminEmail) return;

    const fetchDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/admin/details/${adminEmail}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            name: data.name || '',
            phone: data.phone || '',
            email: data.email || '',
            dob: data.dob || '',
            address: data.address || '',
            identityProof: null,
          });
          setIdentityPreview(data.identity_proof || null);
          setExistingEmail(data.email);
          setIsEditMode(false);
        }
      } catch (err) {
        console.error("Failed to fetch admin details", err);
      }
    };

    fetchDetails();
  }, [adminEmail]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'identityProof' && files && files[0]) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setLocalImagePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setLocalImagePreview(null);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("name", formData.name);
    form.append("phone", formData.phone);
    form.append("email", formData.email);
    form.append("dob", formData.dob);
    form.append("address", formData.address);
    if (formData.identityProof) {
      form.append("identityProof", formData.identityProof);
    }

    try {
      const response = await fetch("http://localhost:8000/api/admin/details", {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      alert("Details saved successfully!");
      setIsEditMode(false);
      setExistingEmail(formData.email);
      setIdentityPreview(data.identity_proof || null);
      setLocalImagePreview(null);
      setFormData((prev) => ({ ...prev, identityProof: null }));
    } catch (err) {
      alert("Error saving details");
      console.error(err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("name", formData.name);
    form.append("phone", formData.phone);
    form.append("dob", formData.dob);
    form.append("address", formData.address);
    if (formData.identityProof) {
      form.append("identityProof", formData.identityProof);
    }

    try {
      const response = await fetch(`http://localhost:8000/api/admin/details/${existingEmail}`, {
        method: "PUT",
        body: form,
      });
      const data = await response.json();
      alert("Details updated successfully!");
      setIsEditMode(false);
      setIdentityPreview(data.identity_proof || null);
      setLocalImagePreview(null);
      setFormData((prev) => ({ ...prev, identityProof: null }));
    } catch (err) {
      alert("Error updating details");
      console.error(err);
    }
  };

  const isImage = identityPreview && /\.(jpg|jpeg|png|gif)$/i.test(identityPreview);

  return (
    <>
      <style>{globalStyle}</style>
      <div className="max-w-4xl mx-auto mt-8 p-8 rounded-lg shadow-lg" style={{ backgroundColor: '#273F4F' }}>
        <h2 className="text-2xl font-semibold text-white mb-6">Admin Personal Details</h2>

        {isEditMode ? (
          <form onSubmit={existingEmail ? handleUpdate : handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="border p-2 rounded bg-white text-gray-900" />
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="border p-2 rounded bg-white text-gray-900" />
            <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="border p-2 rounded bg-white text-gray-900" disabled={!!existingEmail} />
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="border p-2 rounded bg-white text-gray-900" />
            <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="border p-2 rounded col-span-full bg-white text-gray-900" />
            
            <div className="col-span-full relative">
              <label className="block mb-1 text-sm font-medium text-white">Identity Proof (PDF/Image):</label>
              <input type="file" name="identityProof" onChange={handleChange} className="border p-2 rounded w-full bg-white text-gray-900" accept="image/*,.pdf" />
              
              {localImagePreview && (
                <img src={localImagePreview} alt="Selected Identity Proof Preview" className="identity-image mt-2" />
              )}

              {!localImagePreview && identityPreview && isImage && (
                <img src={identityPreview} alt="Uploaded Identity Proof" className="identity-image mt-2" />
              )}

              {!localImagePreview && identityPreview && !isImage && (
                <a href={identityPreview} target="_blank" rel="noopener noreferrer" className="mt-2 block text-sm text-blue-300 underline">
                  View previously uploaded file
                </a>
              )}
            </div>

            <button type="submit" className="col-span-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 mt-4">
              {existingEmail ? "Update Details" : "Save Details"}
            </button>
          </form>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-600">Name</span>
                <span className="text-lg text-gray-900">{formData.name || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-600">Phone</span>
                <span className="text-lg text-gray-900">{formData.phone || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-600">Email</span>
                <span className="text-lg text-gray-900">{formData.email || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-600">Date of Birth</span>
                <span className="text-lg text-gray-900">{formData.dob || 'N/A'}</span>
              </div>
              <div className="flex flex-col md:col-span-2">
                <span className="text-sm font-medium text-gray-600">Address</span>
                <span className="text-lg text-gray-900">{formData.address || 'N/A'}</span>
              </div>
              {identityPreview && (
                <div className="flex flex-col md:col-span-2">
                  <span className="text-sm font-medium text-gray-600">Identity Proof</span>
                  {isImage ? (
                    <img src={identityPreview} alt="Identity Proof" className="identity-image mt-2" />
                  ) : (
                    <a href={identityPreview} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      View uploaded document
                    </a>
                  )}
                </div>
              )}
            </div>
            <button onClick={() => setIsEditMode(true)} className="mt-6 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200">
              Edit Details
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDetailsForm;
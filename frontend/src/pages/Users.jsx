
import React from 'react';

const Users = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">User Management</h2>
      <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl">
        <span>+</span>
        <span>Add User</span>
      </button>
      <div className="mt-6 bg-white rounded-xl shadow-md p-4">User Table Here</div>
    </div>
  );
};

export default Users;

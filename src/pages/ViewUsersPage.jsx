import React, { useState } from "react";
import {  Users } from "lucide-react";
import { Search } from "lucide-react";
import { Eye, Edit3, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

function ViewUsersPage({ users, onNavigate, onEditUser, onDeleteUser }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cnic.includes(searchTerm) ||
      user.university.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (!users.length) {
    return (
      <div className="text-center flex justify-center items-center flex-col min-h-[60vh] py-10">
        <Users size={64} className="mx-auto text-slate-500 mb-4" />
        <h2 className="text-2xl text-slate-400">No users found.</h2>
        <p className="text-slate-500">Why not add one?</p>
        <Link
          to="/users/add" 
          className="mt-6 cursor-pointer bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out"
        >
          Add User
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h2 className="text-3xl font-bold text-sky-400 mb-8 text-center">
        Registered Users
      </h2>
      <div className="mb-6 max-w-md mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, CNIC, university..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors duration-150"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            size={20}
          />
        </div>
      </div>
      {filteredUsers.length === 0 && searchTerm && (
        <p className="text-center text-slate-400 text-lg">
          No users match your search criteria.
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <UserCard
            key={user._id}
            user={user}
            onNavigate={onNavigate}
            onEditUser={onEditUser}
            onDeleteUser={onDeleteUser}
          />
        ))}
      </div>
    </div>
  );
}

function UserCard({ user, onDeleteUser }) {
  const userId = user._id;

  return (
    <div className="bg-slate-800 p-5 rounded-xl shadow-xl hover:shadow-sky-500/20 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-semibold text-sky-400 mb-2">{user.name}</h3>
        <p className="text-sm text-slate-400 mb-1">
          <span className="font-medium text-slate-300">CNIC:</span> {user.cnic}
        </p>
        <p className="text-sm text-slate-400 mb-3">
          <span className="font-medium text-slate-300">University:</span>{" "}
          {user.university}
        </p>
      </div>
      <div className="mt-4 flex justify-between items-center space-x-2 border-t border-slate-700 pt-4">
     
        <Link
          to={`/users/${userId}`}
          className="flex cursor-pointer items-center text-sm bg-sky-500 hover:bg-sky-600 text-white py-2 px-3 rounded-md transition-colors duration-150"
        >
          <Eye size={16} className="mr-1.5" /> View Details
        </Link>

        <div className="flex space-x-2">
          <Link
            to={`/users/edit/${userId}`}
            title="Edit User"
            className="p-2 text-slate-400 hover:text-yellow-400 rounded-md hover:bg-slate-700 transition-colors duration-150"
          >
            <Edit3 size={18} />
          </Link>

          <button
            onClick={() => onDeleteUser(userId)} 
            title="Delete User"
            className="p-2 cursor-pointer text-slate-400 hover:text-red-400 rounded-md hover:bg-slate-700 transition-colors duration-150"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewUsersPage;

import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom'; 
import { Home, Users, UserPlus, FileDown } from 'lucide-react';

function Navbar({ onDownloadPDF }) {
  const navItems = [
    { name: 'Home', path: '/', icon: <Home size={20} />, end: true },
    { name: 'View Users', path: '/users', icon: <Users size={20} />, end: true }, 
    { name: 'Add User', path: '/users/add', icon: <UserPlus size={20} />, end: false },
  ];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getLinkClassName = ({ isActive }) =>
    `flex cursor-pointer items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out ${
      isActive
        ? 'bg-sky-500 text-white shadow-md'
        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`;

  const getMobileLinkClassName = ({ isActive }) =>
    `w-full flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 ease-in-out ${
      isActive
        ? 'bg-sky-500 text-white shadow-md'
        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`;


  return (
    <nav className="bg-slate-900/80 backdrop-blur-md shadow-lg fixed w-full top-0 left-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="font-bold text-xl text-sky-400 cursor-pointer">
              UserVault
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map(item => (
              <NavLink
                key={item.name}
                to={item.path}
                className={getLinkClassName}
                end={item.end}
              >
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </NavLink>
            ))}
          </div>
          <div className="flex items-center">
            <button
              onClick={onDownloadPDF}
              title="Download User Data as PDF"
              className="ml-4 p-2 cursor-pointer rounded-full text-slate-300 hover:bg-slate-700 hover:text-sky-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-colors duration-150 ease-in-out"
            >
              <FileDown size={22} />
            </button>
            <div className="md:hidden ml-2"> 
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-md text-slate-300 hover:bg-slate-700 focus:outline-none">
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map(item => (
              <NavLink
                key={item.name}
                to={item.path}
                className={getMobileLinkClassName}
                onClick={() => setMobileMenuOpen(false)} 
                end={item.end}
              >
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

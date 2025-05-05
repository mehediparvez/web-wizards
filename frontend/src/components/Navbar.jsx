import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation

function Navbar() {
  return (
    <nav className="bg-green-50 py-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="Amarhealth Logo" className="h-10 w-auto" />
            <span className="text-green-800 text-xl font-semibold ml-2">AmarHealth</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-8">
          <Link to="/" className="text-green-800 hover:text-green-600">
            Home
          </Link>
          <Link to="/news" className="text-green-800 hover:text-green-600">
            News
          </Link>
        </div>

        {/* Login and Language */}
        <div className="flex items-center space-x-1 py-2 ml-[-10px]">
          {/* Login Button */}
          <Link
            to="/login"
            className="bg-green-800 text-white px-4 py-2 rounded-full hover:bg-green-700 mr-4"
          >
            Log in
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

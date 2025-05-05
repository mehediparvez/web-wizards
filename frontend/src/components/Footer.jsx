import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-6">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center">
        {/* Left Section */}
        <div className="text-center md:text-left">
          <h2 className="text-lg font-semibold text-white">AmarHealth</h2>
          <p className="mt-2">Providing reliable services since 2024.</p>
        </div>

        {/* Links */}
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="/" className="hover:text-white transition">Home</a>
          <a href="/about" className="hover:text-white transition">About</a>
          <a href="/services" className="hover:text-white transition">Services</a>
          <a href="/contact" className="hover:text-white transition">Contact</a>
        </div>

        {/* Social Media Icons */}
        <div className="flex space-x-4 mt-4 md:mt-0">
          <a href="#" className="hover:text-white transition">
            <i className="fab fa-facebook"></i>
          </a>
          <a href="#" className="hover:text-white transition">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="#" className="hover:text-white transition">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="#" className="hover:text-white transition">
            <i className="fab fa-linkedin"></i>
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-6 text-center text-sm">
        &copy; {new Date().getFullYear()} AmarHealth. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

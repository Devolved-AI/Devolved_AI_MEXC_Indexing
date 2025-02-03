"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HeaderLogo from '../../../public/headerLogo.jpg';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
        {/* Logo */}
        <div className="flex items-center">
        <Link href="/">
              <samp className="flex items-center text-gray-700">
                <Image src="/headerLogo.jpg" alt="Logo" width={40} height={40} className="h-10 w-10" />
                <span className="ml-2 text-xl font-bold">Argochain Scanner</span>
              </samp>
            </Link>
        </div>

        {/* Navigation Links */}
        {/* <nav className="hidden md:flex space-x-4">
          <Link href="/">
            <samp className="text-gray-700 hover:text-[#D91A9C]">Home</samp>
          </Link>
          <Link href="/blocks">
            <samp className="text-gray-700 hover:text-[#D91A9C]">Blocks</samp>
          </Link>
          <Link href="/transactions">
            <samp className="text-gray-700 hover:text-[#D91A9C]">Transactions</samp>
          </Link>
        </nav> */}

        {/* User Account Options */}
        <div className="hidden md:flex items-center space-x-4">
          {/* <Link href="https://devolvedai.com/" target="_blank">
            <samp className="bg-[#D91A9C] text-white px-4 py-2 rounded-full hover:bg-[#e332ab]">Contact Us</samp>
          </Link> */}

          <Link href="https://scanner.argoscan.net/top-100-holder-wallets-addresses">
            <samp className="bg-[#D91A9C] text-white px-4 py-2 rounded-full hover:bg-[#e332ab]">Top 100 Accounts</samp>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button className="text-gray-700 focus:outline-none" onClick={toggleMenu}>
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <nav className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {/* <Link href="/">
              <samp onClick={handleNavLinkClick} className="block text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md">Home</samp>
            </Link>
            <Link href="/blocks">
              <samp onClick={handleNavLinkClick} className="block text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md">Blocks</samp>
            </Link>
            <Link href="/transactions">
              <samp onClick={handleNavLinkClick} className="block text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md">Transactions</samp>
            </Link> */}
            {/* <Link href="https://devolvedai.com/" target="_blank">
            <samp className="bg-[#D91A9C] text-white px-4 py-2 rounded-full hover:bg-[#e332ab]">Contact Us</samp>
          </Link> */}

          <Link href="https://scanner.argoscan.net/top-100-holder-wallets-addresses" target="_blank">
            <samp className="bg-[#D91A9C] text-white px-4 py-2 rounded-full hover:bg-[#e332ab]">Top 100 Accounts</samp>
          </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
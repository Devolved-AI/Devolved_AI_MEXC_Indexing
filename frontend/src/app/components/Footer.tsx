'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaTwitter, FaDiscord, FaLinkedin, FaTelegramPlane } from 'react-icons/fa';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  const [currentYear] = useState(year);

  return (
    <footer className=" text-gray-700 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between">
          {/* Logo and Description */}
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <Link href="/">
              <samp className="flex items-center text-gray-700">
                <Image src="/headerLogo.jpg" alt="Logo" width={40} height={40} className="h-10 w-10" />
                <span className="ml-2 text-xl font-bold">Argochain Scanner</span>
              </samp>
            </Link>
            <p className="mt-4 text-sm">
            Argochain Scanner is a Block Explorer and Analytics Platform for Argochain.
            </p>
          </div>

          {/* Navigation Links */}
          {/* <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Navigation</h3>
            <nav className="space-y-2">
              <Link href="/">
                <samp className="hover:text-[#D91A9C] mr-2">Home</samp>
              </Link>
              <Link href="/blocks">
                <samp className="hover:text-[#D91A9C] mx-2">Blocks</samp>
              </Link>
              <Link href="/transactions">
                <samp className="hover:text-[#D91A9C] mx-2">Transactions</samp>
              </Link>
            </nav>
          </div> */}

          {/* Contact Information */}
          <div className="w-full md:w-1/3">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Contact Us</h3>
            {/* <p className="text-sm">Email: info@devolvedai.com</p>
            <p className="text-sm">Phone: +0 000 000 000</p> */}
            <div className="flex mt-4 space-x-4">
              <samp className="text-gray-700 hover:text-gray-600">
                <Link href="https://twitter.com/devolvedai" target='_blank'>
                  <FaTwitter className="h-6 w-6" />
                </Link>
              </samp>
              <samp className="text-gray-700 hover:text-gray-600">
                <Link href="https://discord.com/invite/devolvedai" target='_blank'>
                  <FaDiscord className="h-6 w-6" />
                </Link>
              </samp>
              <samp className="text-gray-700 hover:text-gray-600">
                <Link href="https://www.linkedin.com/company/devolvedai" target='_blank'>
                  <FaLinkedin className="h-6 w-6" />
                </Link>
              </samp>
              <samp className="text-gray-700 hover:text-gray-600">
                <Link href="https://t.me/devolvedai" target='_blank'>
                  <FaTelegramPlane className="h-6 w-6" />
                </Link>
              </samp>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-4 text-center">
          <p className="text-sm">&copy; {currentYear} DevolvedAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

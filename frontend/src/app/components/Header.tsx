"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HeaderLogo from '../../../public/headerLogo.jpg';
import { FaUser } from 'react-icons/fa';
import { profile, auth_logout } from "@/app/var";

import Cookies from 'js-cookie';
// import { jwtDecode } from 'jwt-decode';

import { useRouter } from 'next/navigation';

import { cookies } from 'next/headers';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [email, setEmail]: any = useState(null);
  const [userToken, setUserToken] = useState<string | null>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavLinkClick = () => {
    setIsMenuOpen(false);
  };

  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  // const handleSignOut = () => {
  //   // Clear cookies
  //   Cookies.remove('email');
  //   Cookies.remove('access_token');

  //   // Redirect to the login page
  //   router.push('/login');
  // };

  const handleSignOut = async () => {
    const accessToken = Cookies.get('access_token');
    console.log("accessToken logout", accessToken);
    try {
      if (accessToken) {
        const response = await fetch(auth_logout, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
          console.error("Logout API failed", await response.json());
        }
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
    // Clear cookies
    Cookies.remove('email');
    Cookies.remove('access_token');

    // Redirect to the login page
    router.push('/login');
  };


  useEffect(() => {
    // Fetch profile information from the API
    const fetchProfile = async () => {
      const accessToken = Cookies.get("access_token");
      // setUserToken(accessToken);

      if (!accessToken) {
        console.error("No access token found.");
        return;
      }

      try {
        setUserToken(accessToken);
        const response = await fetch(profile, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const res = await response.json();
          if (res.success) {
            setEmail(res.data.email);
          } else {
            console.error(res.message || "Error retrieving profile data.");
          }
        } else {
          const errorData = await response.json();
          console.error(errorData.message || "Failed to fetch profile data.");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <header className="bg-white shadow-md">
      {/* <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4"> */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
        {/* Logo */}
        <div>

          <div className="flex items-center">
            <Link href="/">
              <samp className="flex items-center text-gray-700">
                <Image src="/headerLogo.jpg" alt="Logo" width={40} height={40} className="h-10 w-10" />
                <span className="ml-2 text-xl font-bold">Argochain Test Scanner</span>
              </samp>
            </Link>
          </div>

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

        <div className=' hidden md:flex'>
          {/* User Account Options */}
          {/* <div className="hidden md:flex items-center space-x-4">
          <Link href="https://devolvedai.com/" target="_blank">
            <samp className="bg-[#D91A9C] text-white px-4 py-2 rounded-full hover:bg-[#e332ab]">Contact Us</samp>
          </Link>
        </div> */}
          <div className="flex items-center px-4 py-2 mx-1 text-sm font-medium text-gray-700 bg-[#D91A9C] border border-gray-300 rounded-md shadow-sm dark:bg-gray-800 dark:text-white hover:bg-[#e332ab] dark:hover:bg-gray-700 focus:outline-none">
            {/* <Link href="https://devolvedai.com/" target="_blank">
              <samp className=" text-white px-4 py-2">Contact Us</samp>
            </Link> */}
            <Link href="https://test-scanner.devolvedai.com/top-100-holder-wallets-addresses">
              <samp className=" text-white px-4 py-2">Top 100 Accounts</samp>
            </Link>
          </div>
          {/* profile section */}

          <div className="relative inline-block text-left">
            {
              userToken ? ((
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                >
                  <FaUser className="mr-2" />
                  <span>Profile</span>
                </button>
              )) : ((
                <button
                  // onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                >
                  <FaUser className="mr-2" />
                  <Link href={'/login'}>Sign In</Link>
                </button>
              ))
            }


            {isOpen && (
              <div
                className="absolute right-0 z-10 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg dark:bg-gray-700 dark:border-gray-600"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="dropdownAvatarNameButton"
              >
                <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  <div className="font-medium">User Email</div>
                  <div className="truncate">{email}</div>
                </div>
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownAvatarNameButton">
                  <li>
                    <Link href="/myaccount" onClick={() => setIsOpen(!isOpen)} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">My Account</Link>
                  </li>
                  <li>
                    {/* <Link href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Settings</Link> */}
                  </li>

                </ul>


                <div className="py-2">
                  <samp onClick={handleSignOut} className="block px-4 py-2 cursor-pointer text-sm font-semibold text-gray-700 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">
                    Sign out
                  </samp>
                </div>

              </div>
            )}
          </div>
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

            <div
              className=" right-0 z-10 mt-2 w-56 bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="dropdownAvatarNameButton"
            >
              <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                <div className="font-medium">Pro User</div>
                <div className="truncate">name@flowbite.com</div>
              </div>
              <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownAvatarNameButton">
                <li>
                  <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Dashboard</a>
                </li>
                <li>
                  {/* <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Settings</a> */}
                </li>
                {/* <li>
              <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Earnings</a>
            </li> */}
              </ul>
              <div className="py-2">

                <Link href="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">
                  Sign out
                </Link>
              </div>
            </div>

            {/* <Link href="https://devolvedai.com/" target="_blank">
              <samp className="bg-[#D91A9C] text-white px-4 py-2 rounded-full hover:bg-[#e332ab]">Contact Us</samp>
            </Link> */}
            <Link href="https://test-scanner.devolvedai.com/top-100-holder-wallets-addresses">
              <samp className="bg-[#D91A9C] text-white px-4 py-2 rounded-full hover:bg-[#e332ab]">Top 100 Accounts</samp>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
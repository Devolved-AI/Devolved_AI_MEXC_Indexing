"use client"

import Link from 'next/link';
// import React from 'react';
import React, { useState, useEffect } from "react";
import Cookies from 'js-cookie';

const MyAccount: React.FC = () => {
  const [contractAddress, setContractAddress] = useState("");
  const [email, setEmail] = useState(null);
   // Load data from local storage on component mount
   useEffect(() => {
    const storedContractAddress = localStorage.getItem('contractAddress');

    if (storedContractAddress) setContractAddress(storedContractAddress);
  }, []);


  useEffect(() => {
    // Access email cookie on the client side
    const emailCookie:any = Cookies.get('email');
    setEmail(emailCookie);
  }, []);

  

  console.log(contractAddress)

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 md:px-16 lg:px-32">
      {/* Back to Home Link */}
      <Link href="/" passHref>
        <samp className="text-blue-600 hover:underline">Back Home</samp>
      </Link>

      <div className="mt-6 bg-white shadow-lg rounded-lg p-6">
        {/* Account Overview */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Account Overview</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar Navigation */}
          <aside className="col-span-1 bg-gray-50 border rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-700">Account</h2>
            <ul className="space-y-3 mt-3">
              <li><Link href="#" className="text-blue-600 hover:underline">Account Overview</Link></li>
              <li><Link href="#" className="text-blue-600 hover:underline">Account Settings</Link></li>
            </ul>

            <h2 className="text-lg font-semibold text-gray-700 mt-6">Lists</h2>
            <ul className="space-y-3 mt-3">
              <li><Link href="#" className="text-blue-600 hover:underline">Watch List</Link></li>
              <li><Link href="#" className="text-blue-600 hover:underline">Private Name Tags</Link></li>
              <li><Link href="#" className="text-blue-600 hover:underline">Txn Private Notes</Link></li>
              <li><Link href="#" className="text-blue-600 hover:underline">Token Ignore List</Link></li>
              <li><Link href="#" className="text-blue-600 hover:underline">Advanced Filter</Link></li>
            </ul>

            <h2 className="text-lg font-semibold text-gray-700 mt-6">Others</h2>
            <ul className="space-y-3 mt-3">
              {/* <li><Link href="#" className="text-blue-600 hover:underline">API Keys</Link></li> */}
              <li><Link href="/myverify_address" className="text-blue-600 hover:underline">Verified Addresses</Link></li>
              {/* Argocoin: AGC Token */}
              <li><Link href={`/contract-address/${contractAddress}`} className="text-blue-600 hover:underline">Argocoin: AGC Token</Link></li>
            </ul>
          </aside>

          {/* Main Content */}
          <section className="col-span-2">
            <div className="bg-gray-50 border rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Info</h2>
              <p className="text-gray-700">Below are the username, email, and overview information for your account.</p>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="font-medium text-gray-800">Your Username:</p>
                  <p className="text-gray-600"></p>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Your Email Address:</p>
                  <p className="text-gray-600">{email}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Last Login:</p>
                  <p className="text-gray-600">2024-11-05 04:06:41 (UTC)</p>
                </div>
              </div>
            </div>

            {/* Overview Usage */}
            {/* <div className="bg-gray-50 border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Overview Usage</h2>
              <p className="text-gray-700 mb-4">Usage of account features such as address watch list, address name tags, and API keys.</p>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800">Total POL Balance (Watch List):</span>
                  <span className="text-gray-600">0 POL ($0.00)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800">Email Notification Limit:</span>
                  <span className="text-gray-600">0 emails sent out / 100 daily limit</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800">Address Watch List:</span>
                  <span className="text-gray-600">0 address alert(s) / 50 limit</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800">Txn Private Notes:</span>
                  <span className="text-gray-600">0 transaction private note(s) / 10,000 limit</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800">Address Tags:</span>
                  <span className="text-gray-600">0 address tag(s) / 5,000 limit</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800">API Key Usage:</span>
                  <span className="text-gray-600">0 active API(s) / 3 limit</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800">Verified Addresses:</span>
                  <span className="text-gray-600">0 verified addresses / Unlimited</span>
                </div>
              </div>
            </div> */}

          </section>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;

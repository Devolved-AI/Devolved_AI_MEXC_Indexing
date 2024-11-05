"use client"

import { useState } from 'react';
import Link from 'next/link';

const MyVerifyAddress: React.FC = () => {
  const [currentPage] = useState(1);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            My Verified Addresses
          </h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md">
            <Link href="/verifycontract">Add Address</Link>
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The Verify Address Ownership process involves verifying the ownership of a Polygon PoS Chain address used to create a Polygon PoS Chain smart contract. This verification will be linked to a PolygonScan account. Once a user has claimed ownership of an address, the user will be able to update token information and address name tags without needing to sign a new message each time. <Link href="#" className="text-blue-600 hover:underline">Find out more about verify address ownership.</Link>
        </p>

        <div className="text-gray-700 dark:text-gray-300 mb-4">
          <p>0 address verified</p>
        </div>

        <div className="overflow-x-auto bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner p-4">
          <table className="min-w-full text-sm text-gray-800 dark:text-gray-200">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-600">
                <th className="px-4 py-2 text-left font-medium uppercase text-gray-600 dark:text-gray-400">Address</th>
                <th className="px-4 py-2 text-left font-medium uppercase text-gray-600 dark:text-gray-400">Quick Links</th>
                <th className="px-4 py-2 text-left font-medium uppercase text-gray-600 dark:text-gray-400">Verified Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                  You have yet to verify any address.<br /> Please try again later.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="text-gray-600 dark:text-gray-400">
            Page 1 of 1
          </div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded disabled:opacity-50"
              disabled
            >
              First
            </button>
            <button
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded disabled:opacity-50"
              disabled
            >
              Previous
            </button>
            <button
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded disabled:opacity-50"
              disabled
            >
              Next
            </button>
            <button
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded disabled:opacity-50"
              disabled
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyVerifyAddress;

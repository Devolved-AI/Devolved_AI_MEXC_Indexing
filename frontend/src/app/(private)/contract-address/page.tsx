"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { get_users_all_contract } from "@/app/var";
import Link from 'next/link';

// Define an interface for the contract data structure
interface Contract {
  contractName: string;
  contractAddress: string;
  createdAt: string;
}

const AddressDetails: React.FC = () => {
  // Use the Contract type for the state to ensure correct typing
  const [contractAddresses, setContractAddresses] = useState<Contract[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const accessToken = Cookies.get("access_token");

    if (!accessToken) {
      setError("No access token found.");
      setContractAddresses([]); // Clear contract addresses if no token
      return;
    }

    const fetchContractAddresses = async () => {
      try {
        const response = await fetch(get_users_all_contract, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const res = await response.json();
          console.log(res);

          if (res.success) {
            setContractAddresses(res.data as Contract[]); // Type assertion for API data
            setError(""); // Clear any previous error
          } else {
            setError(res.message || "Error retrieving contract data.");
            setContractAddresses([]); // Clear contract addresses on error
          }
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to fetch contract addresses.");
          setContractAddresses([]); // Clear contract addresses on error
        }
      } catch (error) {
        console.error("Error fetching contract addresses:", error);
        setError("An unexpected error occurred.");
        setContractAddresses([]); // Clear contract addresses on error
      }
    };

    fetchContractAddresses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg shadow-md">
            <p>{error}</p>
          </div>
        )}

        {/* Contract Addresses List */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Contracts List</h1>
          {contractAddresses.length > 0 ? (
            <ul className="mt-4 space-y-4">
              {contractAddresses.map((contract, index) => (
                <li key={index} className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg">
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    Contract Name: {contract.contractName}
                  </p>
                  <p className="text-blue-500 font-mono break-all">
                    Contract Address <Link href={`/contract-address/${contract.contractAddress}`} className="text-blue-500 font-mono hover:underline">{contract.contractAddress}</Link>
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    Date Created: {new Date(contract.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No contracts found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressDetails;

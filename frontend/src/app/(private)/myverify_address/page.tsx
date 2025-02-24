"use client"

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { get_users_all_contract } from "@/app/var";
import Link from 'next/link';

interface Contract {
  contractName: string;
  contractAddress: string;
  createdAt: string;
}

const MyVerifyAddress: React.FC = () => {
  const [contractAddresses, setContractAddresses] = useState<Contract[]>([]);
  const [contractAddressesTest, setContractAddressesTest] = useState<Contract[]>([
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    },
    {
      contractName: "Test Contract",
      contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
      createdAt: "2021-09-01T00:00:00Z",
    }
  ]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContractAddresses = async () => {
      const accessToken = Cookies.get("access_token");
      if (!accessToken) {
        setError("No access token found.");
        setContractAddresses([]);
        return;
      }

      try {
        const response = await fetch(get_users_all_contract, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const res = await response.json();
          console.log("all verify contact", res)
          if (res.success) {
            setContractAddresses(res.data as Contract[]);
            setError(null);
          } else {
            setError(res.message || "Error retrieving contract data.");
            setContractAddresses([]);
          }
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to fetch contract addresses.");
          setContractAddresses([]);
        }
      } catch (error) {
        console.error("Error fetching contract addresses:", error);
        setError("An unexpected error occurred.");
        setContractAddresses([]);
      }
    };

    fetchContractAddresses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Verified Addresses</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md">
            <Link href="/verifycontract">Add Address</Link>
          </button>
        </div>

        {error ? (
          <p className="text-red-500 text-center mb-4">{error}</p>
        ) : (
          <>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
            The Verify Address Ownership process involves verifying the ownership of an Argo Chain address used to create an Argo Chain smart contract. Once verified, users can update token information and address name tags on the network.
            </p>

            <div className="overflow-x-auto bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner p-4">
              <table className="min-w-full text-sm text-gray-800 dark:text-gray-200">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-600">
                    <th className="px-4 py-2 text-left font-medium uppercase text-gray-600 dark:text-gray-400">Address</th>
                    <th className="px-4 py-2 text-left font-medium uppercase text-gray-600 dark:text-gray-400">Quick Link</th>
                    <th className="px-4 py-2 text-left font-medium uppercase text-gray-600 dark:text-gray-400">Verified Date</th>
                  </tr>
                </thead>
                <tbody>
                  {contractAddressesTest.length > 0 ? (
                    contractAddressesTest.map((contract) => (
                      <tr key={contract.contractAddress} className="border-b border-gray-300 dark:border-gray-600">
                        <td className="px-4 py-2">
                          <span className="font-mono break-all">
                          <Link href={`/contract-address/${contract.contractAddress}`} className="text-blue-600 hover:underline">
                            {contract.contractAddress}
                          </Link>
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <Link href={`/address/${contract.contractAddress}`} className="text-blue-600 hover:underline">
                            View Contract
                          </Link>
                        </td>
                        <td className="px-4 py-2">
                          {new Date(contract.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                        You have yet to verify any address.
                        Please try again later.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-6">
              <div className="text-gray-600 dark:text-gray-400">Page 1 of 1</div>
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
          </>
        )}
      </div>
    </div>
  );
};

export default MyVerifyAddress;

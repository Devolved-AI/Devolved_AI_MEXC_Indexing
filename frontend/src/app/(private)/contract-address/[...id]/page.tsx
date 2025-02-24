"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { usePathname } from "next/navigation";
import { get_users_contract_details } from "@/app/var"; // Ensure this contains the correct endpoint URL for contract details

const AddressDetails: React.FC = () => {
  const pathname = usePathname();
  const contractAddress = pathname?.split("/").pop();

  const [contractDetails, setContractDetails] = useState<any>({});
  const [contractDetailsTest, setContractDetailsTest] = useState<any>({
    contractAddress: "0x0731940086120a7a059c9a43e3940da0e60189f1",
    contractName: "Test Contract",
    verificationStatus: "Verified",
    abi: [
      {
        constant: true,
        inputs: [],
        name: "name",
        outputs: [{ name: "", type: "string" }],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "symbol",
        outputs: [{ name: "", type: "string" }],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ],
    sourceCode: `pragma solidity ^0.4.17;
contract TestContract {
  string public name = "Test Contract"; 
  string public symbol = "TEST";
}`,
    deployedBytecode: "0x608060405234801561001057600080fd5b5061015e806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806360fe47b1146100465780636d4ce63c1461006f575b600080fd5b61004e6004803603602081101561005c57600080fd5b81019080803590602001909291905050506100a3565b005b61006d6004803603602081101561007b57600080fd5b81019080803590602001909291905050506100c6565b005b60008054905090565b60005481565b60008054905090565b60006020820190506100e460008301846100e0565b92915050565b"
  });

  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState<{ abi: boolean; code: boolean }>({ abi: false, code: false });

  // Function to copy text to clipboard
  const handleCopy = (text: string, type: "abi" | "code") => {
    navigator.clipboard.writeText(text);
    setIsCopied((prevState) => ({ ...prevState, [type]: true }));

    setTimeout(() => {
      setIsCopied((prevState) => ({ ...prevState, [type]: false }));
    }, 2000); // Reset "Copied" text after 2 seconds
  };

  // Fetch contract details when contractAddress is available
  useEffect(() => {
    const accessToken = Cookies.get("access_token");

    if (!contractAddress || !accessToken) {
      setError("No contract address or access token found.");
      return;
    }

    const fetchContractDetails = async () => {
      try {
        const response = await fetch(get_users_contract_details, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ contractAddress })
        });

        if (response.ok) {
          const res = await response.json();
          if (res.success) {
            setContractDetails(res.data);
          } else {
            setContractDetails({});
            setError("Failed to retrieve contract details.");
          }
        } else {
          setContractDetails({});
          setError("Failed to fetch contract details.");
        }
      } catch (error) {
        console.error("Error fetching contract details:", error);
        setContractDetails({});
        setError("An unexpected error occurred.");
      }
    };

    fetchContractDetails();
  }, [contractAddress]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg shadow-md">
            <p>{error}</p>
          </div>
        )}

        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Contract</h1>
          <p className="text-blue-500 text-lg font-mono break-all mt-2">
            {contractAddress}
          </p>
        </div>

        {/* Contract Details Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Contract Details</h2>

          {/* Display contract details */}
          {/* <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contract Name:</label>
              <p className="text-gray-800 dark:text-white">{contractDetails.contractName || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contract Address:</label>
              <p className="text-gray-800 dark:text-white">{contractDetails.contractAddress || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Verification Status:</label>
              <p className="text-gray-800 dark:text-white">{contractDetails.verificationStatus || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ABI:</label>
              <button
                onClick={() => handleCopy(contractDetails.abi || "N/A", "code")}
                className="absolute top-0 right-0 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400"
              >
                {isCopied.code ? "Copied" : "Copy"}
              </button>
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md text-sm text-gray-800 dark:text-gray-200 overflow-y-auto overflow-x-auto">
                {contractDetails.abi ? JSON.stringify(contractDetails.abi, null, 2) : "N/A"}
              </pre>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Source Code:</label>
              <button
                onClick={() => handleCopy(contractDetails.sourceCode || "N/A", "code")}
                className="absolute top-0 right-0 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400"
              >
                {isCopied.code ? "Copied" : "Copy"}
              </button>
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md text-sm text-gray-800 dark:text-gray-200 overflow-y-auto overflow-x-auto">
                {contractDetails.sourceCode || "N/A"}
              </pre>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deployed Bytecode:</label>
              <button
                onClick={() => handleCopy(contractDetails.deployedBytecode || "N/A", "code")}
                className="absolute top-0 right-0 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400"
              >
                {isCopied.code ? "Copied" : "Copy"}
              </button>
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                {contractDetails.deployedBytecode || "N/A"}
              </pre>
            </div>
          </div> */}

{/* test section */}
<div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contract Name:</label>
              <p className="text-gray-800 dark:text-white">{contractDetailsTest.contractName || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contract Address:</label>
              <p className="text-gray-800 dark:text-white">{contractDetailsTest.contractAddress || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Verification Status:</label>
              <p className="text-gray-800 dark:text-white">{contractDetailsTest.verificationStatus || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ABI:</label>
              <button
                onClick={() => handleCopy(contractDetailsTest.abi || "N/A", "code")}
                className="absolute top-0 right-0 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400"
              >
                {isCopied.code ? "Copied" : "Copy"}
              </button>
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md text-sm text-gray-800 dark:text-gray-200 overflow-y-auto overflow-x-auto">
                {contractDetailsTest.abi ? JSON.stringify(contractDetailsTest.abi, null, 2) : "N/A"}
              </pre>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Source Code:</label>
              <button
                onClick={() => handleCopy(contractDetailsTest.sourceCode || "N/A", "code")}
                className="absolute top-0 right-0 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400"
              >
                {isCopied.code ? "Copied" : "Copy"}
              </button>
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md text-sm text-gray-800 dark:text-gray-200 overflow-y-auto overflow-x-auto">
                {contractDetailsTest.sourceCode || "N/A"}
              </pre>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deployed Bytecode:</label>
              <button
                onClick={() => handleCopy(contractDetailsTest.deployedBytecode || "N/A", "code")}
                className="absolute top-0 right-0 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400"
              >
                {isCopied.code ? "Copied" : "Copy"}
              </button>
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                {contractDetailsTest.deployedBytecode || "N/A"}
              </pre>
            </div>
          </div>



        </div>
      </div>
    </div>
  );
};

export default AddressDetails;

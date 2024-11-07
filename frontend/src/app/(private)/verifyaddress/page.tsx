"use client"

import Link from 'next/link';
import { useState } from 'react';

const VerifyAddress: React.FC = () => {
    const [contractAddress, setContractAddress] = useState('');

    const handleContinue = () => {
        // Implement the continue button functionality here, e.g., validation or API call
        console.log("Contract Address:", contractAddress);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                    Verify Address Ownership
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    <Link href="#" className="text-blue-600 hover:underline">Find out more about Verify Address Ownership</Link>
                </p>

                <form onSubmit={(e) => e.preventDefault()}>
                    <label htmlFor="contractAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Please enter contract address *
                    </label>
                    <input
                        type="text"
                        id="contractAddress"
                        value={contractAddress}
                        onChange={(e) => setContractAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full px-4 py-2 mb-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                    />

                    <input
                        type="text"
                        id="contractAddress"
                        value={contractAddress}
                        onChange={(e) => setContractAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full px-4 py-2 mb-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                    />

                    <input
                        type="text"
                        id="contractAddress"
                        value={contractAddress}
                        onChange={(e) => setContractAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full px-4 py-2 mb-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                    />

                    <button
                        type="button"
                        onClick={handleContinue}
                        className="mt-6 w-full py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyAddress;

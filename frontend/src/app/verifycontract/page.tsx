"use client"

import Link from 'next/link';
import { useState } from 'react';

const VerifyContract: React.FC = () => {
  const [contractAddress, setContractAddress] = useState('');
  const [compilerType, setCompilerType] = useState('');
  const [compilerVersion, setCompilerVersion] = useState('');
  const [licenseType, setLicenseType] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleContinue = () => {
    // Implement continue logic, e.g., validation or API call
    console.log('Continuing with:', {
      contractAddress,
      compilerType,
      compilerVersion,
      licenseType,
      agreedToTerms,
    });
  };

  const handleReset = () => {
    // Reset all form fields
    setContractAddress('');
    setCompilerType('');
    setCompilerVersion('');
    setLicenseType('');
    setAgreedToTerms(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Verify & Publish Contract Source Code
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Source code verification provides transparency for users interacting with smart contracts. By uploading the source code, Moonbase will match the compiled code with that on the blockchain. <a href="#" className="text-blue-600 hover:underline">Read more.</a>
        </p>

        <ol className="list-decimal list-inside mb-6 text-gray-700 dark:text-gray-300">
          <li>Enter Contract Details</li>
          <li>Verify & Publish</li>
        </ol>

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Contract Address Input */}
          <label htmlFor="contractAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Please enter the Contract Address you would like to verify
          </label>
          <input
            type="text"
            id="contractAddress"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
            required
          />

          {/* Compiler Type Dropdown */}
          <label htmlFor="compilerType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Please select Compiler Type
          </label>
          <select
            id="compilerType"
            value={compilerType}
            onChange={(e) => setCompilerType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
          >
            <option value="">Please Select</option>
            <option value="Solidity">Solidity</option>
            <option value="Vyper">Vyper</option>
          </select>

          {/* Compiler Version Dropdown */}
          <label htmlFor="compilerVersion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Please select Compiler Version
          </label>
          <select
            id="compilerVersion"
            value={compilerVersion}
            onChange={(e) => setCompilerVersion(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
          >
            <option value="">Please Select</option>
            <option value="0.8.0">0.8.0</option>
            <option value="0.7.0">0.7.0</option>
          </select>

          {/* License Type Dropdown */}
          <label htmlFor="licenseType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Please select Open Source License Type
          </label>
          <select
            id="licenseType"
            value={licenseType}
            onChange={(e) => setLicenseType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
          >
            <option value="">Please Select</option>
            <option value="MIT">MIT</option>
            <option value="GPL">GPL</option>
          </select>

          {/* Terms Checkbox */}
          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={() => setAgreedToTerms(!agreedToTerms)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              I agree to the terms of service
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            >
              Reset
            </button>
            {/* <button
              type="button"
              onClick={handleContinue}
              disabled={!agreedToTerms || !contractAddress}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Continue
            </button> */}
             <button
              type="button"
              onClick={handleContinue}
              disabled={!agreedToTerms || !contractAddress}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Link href="/verifyContract-solc-multiple">Continue</Link>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyContract;

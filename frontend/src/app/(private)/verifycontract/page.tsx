"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import licenseOptions from './licenseOptions.json';

interface CompilerOption {
  value: string;
  label: string;
}

interface Build {
  path: string;
  version: string;
  build: string;
  longVersion: string;
  keccak256: string;
  sha256: string;
  urls: string[];
  prerelease?: string;
}

interface CompilerList {
  builds: Build[];
  releases: Record<string, string>;
  latestRelease: string;
}

const VerifyContract: React.FC = () => {
  const router = useRouter();

  const [contractAddress, setContractAddress] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [compilerVersion, setCompilerVersion] = useState(''); // empty initial value
  const [licenseType, setLicenseType] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [isLatest, setIsLatest] = useState(true);
  const [compilerOptions, setCompilerOptions] = useState<{ latest: CompilerOption[]; nightly: CompilerOption[] }>({
    latest: [],
    nightly: [],
  });

  useEffect(() => {
    // Fetch the JSON from the Solidity binaries URL and strongly type the response
    fetch('https://binaries.soliditylang.org/bin/list.json')
      .then((response) => response.json() as Promise<CompilerList>)
      .then((data: CompilerList) => {
        const builds: Build[] = data.builds;

        // Separate builds into stable and nightly based on the longVersion field.
        const stable = builds
          .filter((build) => !build.longVersion.includes('nightly'))
          .map((build) => {
            const formatted = build.longVersion.startsWith('v') ? build.longVersion : `v${build.longVersion}`;
            return { value: formatted, label: formatted };
          });

        const nightly = builds
          .filter((build) => build.longVersion.includes('nightly'))
          .map((build) => {
            const formatted = build.longVersion.startsWith('v') ? build.longVersion : `v${build.longVersion}`;
            return { value: formatted, label: formatted };
          });

        setCompilerOptions({ latest: stable, nightly });
      })
      .catch((error) => console.error('Error fetching compiler list:', error));
  }, []);

  const handleContinue = () => {
    localStorage.setItem('contractAddress', contractAddress);
    localStorage.setItem('walletAddress', walletAddress);
    localStorage.setItem('compilerVersion', compilerVersion);
    localStorage.setItem('licenseType', licenseType);
    router.push('/verifyContract-solc-multiple');
  };

  const toggleVersion = () => {
    setIsLatest((prev) => !prev);
  };

  const handleReset = () => {
    setContractAddress('');
    setWalletAddress('');
    setCompilerVersion('');
    setLicenseType('');
    localStorage.clear();
  };

  // Choose the options based on whether we're showing stable (latest) or nightly builds.
  const currentCompilerOptions = isLatest ? compilerOptions.latest : compilerOptions.nightly;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Verify & Publish Contract Source Code
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Source code verification provides transparency and trust for users interacting with smart contracts on Argo Chain.
          By uploading your contract&apos;s source code, Argo Chain will verify that the compiled code exactly matches the deployed version.
        </p>

        <ol className="list-decimal list-inside mb-6 text-gray-700 dark:text-gray-300">
          <li>Enter Contract Details</li>
          <li>Verify & Publish</li>
        </ol>

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Wallet Address Input */}
          <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Please enter your Wallet Address
          </label>
          <input
            type="text"
            id="walletAddress"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
            required
          />

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

          {/* Compiler Version Dropdown */}
          <label htmlFor="compilerVersion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Please select Compiler Version
          </label>
          <select
            id="compilerVersion"
            value={compilerVersion}
            onChange={(e) => setCompilerVersion(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 overflow-auto rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
            style={{ maxHeight: "200px", overflowY: "auto" }}
          >
            <option value="">Please select</option>
            {currentCompilerOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Toggle for Stable / Nightly */}
          <label className="flex items-center cursor-pointer mb-4">
            <input type="checkbox" checked={isLatest} onChange={toggleVersion} className="hidden" />
            <div
              className={`w-10 h-5 flex items-center rounded-full p-1 duration-300 ${
                isLatest ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-md transform duration-300 ${
                  isLatest ? "translate-x-5" : ""
                }`}
              ></div>
            </div>
            <span className="ml-2 text-gray-800">Uncheck to show all nightly builds</span>
          </label>

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
            {licenseOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Agreement Checkbox */}
          <div className="flex items-center space-x-2 mb-4">
            <label className="relative cursor-pointer flex items-center">
              <input
                type="checkbox"
                className="hidden"
                checked={agreed}
                disabled
                onChange={() => setAgreed(!agreed)}
              />
              <div
                className={`w-5 h-5 border-2 border-gray-400 rounded-full flex items-center justify-center ${
                  agreed ? "border-blue-500" : ""
                }`}
              >
                {agreed && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
              </div>
            </label>
            <span className="text-gray-700">
              I agree to the{" "}
              <a
                href="/terms-conditions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                terms of service
              </a>
            </span>
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
            <button
              type="button"
              onClick={handleContinue}
              disabled={!contractAddress || !compilerVersion}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyContract;

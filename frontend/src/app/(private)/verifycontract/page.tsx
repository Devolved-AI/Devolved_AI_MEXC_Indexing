"use client"

// import { useRouter } from 'next/router';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

const VerifyContract: React.FC = () => {
  const router = useRouter(); // Initialize useRouter for navigation

  const [contractAddress, setContractAddress] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [compilerType, setCompilerType] = useState('');
  const [compilerVersion, setCompilerVersion] = useState('');
  const [licenseType, setLicenseType] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleContinue = () => {
    // Save data to local storage
    localStorage.setItem('contractAddress', contractAddress);
    localStorage.setItem('walletAddress', walletAddress);
    localStorage.setItem('compilerVersion', compilerVersion);
    localStorage.setItem('licenseType', licenseType);

    // Redirect to the specified page
    router.push('/verifyContract-solc-multiple');
  };

  const handleReset = () => {
    // Reset all form fields
    setContractAddress('');
    setWalletAddress('');
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
          {/* Wallet Address Input */}
          <label htmlFor="contractAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            <option value="">Please Select</option>
            <option value="v0.8.24+commit.e11b9ed9">v0.8.24+commit.e11b9ed9</option>
            <option value="v0.8.23+commit.f704f362">v0.8.23+commit.f704f362</option>
            <option value="v0.8.22+commit.4fc1097e">v0.8.22+commit.4fc1097e</option>
            <option value="v0.8.21+commit.d9974bed">v0.8.21+commit.d9974bed</option>
            <option value="v0.8.20+commit.a1b79de6">v0.8.20+commit.a1b79de6</option>
            <option value="v0.8.19+commit.7dd6d404">v0.8.19+commit.7dd6d404</option>
            <option value="v0.8.18+commit.87f61d96">v0.8.18+commit.87f61d96</option>
            <option value="v0.8.17+commit.8df45f5f">v0.8.17+commit.8df45f5f</option>
            <option value="v0.8.16+commit.07a7930e">v0.8.16+commit.07a7930e</option>
            <option value="v0.8.15+commit.e14f2714">v0.8.15+commit.e14f2714</option>
            <option value="v0.8.14+commit.80d49f37">v0.8.14+commit.80d49f37</option>
            <option value="v0.8.13+commit.abaa5c0e">v0.8.13+commit.abaa5c0e</option>
            <option value="v0.8.12+commit.f00d7308">v0.8.12+commit.f00d7308</option>
            <option value="v0.8.11+commit.d7f03943">v0.8.11+commit.d7f03943</option>
            <option value="v0.8.10+commit.fc410830">v0.8.10+commit.fc410830</option>
            <option value="v0.8.9+commit.e5eed63a">v0.8.9+commit.e5eed63a</option>
            <option value="v0.8.8+commit.dddeac2f">v0.8.8+commit.dddeac2f</option>
            <option value="v0.8.7+commit.e28d00a7">v0.8.7+commit.e28d00a7</option>
            <option value="v0.8.6+commit.11564f7e">v0.8.6+commit.11564f7e</option>
            <option value="v0.8.5+commit.a4f2e591">v0.8.5+commit.a4f2e591</option>
            <option value="v0.8.4+commit.c7e474f2">v0.8.4+commit.c7e474f2</option>
            <option value="v0.8.3+commit.8d00100c">v0.8.3+commit.8d00100c</option>
            <option value="v0.8.2+commit.661d1103">v0.8.2+commit.661d1103</option>
            <option value="v0.8.1+commit.df193b15">v0.8.1+commit.df193b15</option>
            <option value="v0.8.0+commit.c7dfd78e">v0.8.0+commit.c7dfd78e</option>
            <option value="v0.7.6+commit.7338295f">v0.7.6+commit.7338295f</option>
            <option value="v0.7.5+commit.eb77ed08">v0.7.5+commit.eb77ed08</option>
            <option value="v0.7.4+commit.3f05b770">v0.7.4+commit.3f05b770</option>
            <option value="v0.7.3+commit.9bfce1f6">v0.7.3+commit.9bfce1f6</option>
            <option value="v0.7.2+commit.51b20bc0">v0.7.2+commit.51b20bc0</option>
            <option value="v0.7.1+commit.f4a555be">v0.7.1+commit.f4a555be</option>
            <option value="v0.7.0+commit.9e61f92b">v0.7.0+commit.9e61f92b</option>
            <option value="v0.6.12+commit.27d51765">v0.6.12+commit.27d51765</option>
            <option value="v0.6.11+commit.5ef660b1">v0.6.11+commit.5ef660b1</option>
            <option value="v0.6.10+commit.00c0fcaf">v0.6.10+commit.00c0fcaf</option>
            <option value="v0.6.9+commit.3e3065ac">v0.6.9+commit.3e3065ac</option>
            <option value="v0.6.8+commit.0bbfe453">v0.6.8+commit.0bbfe453</option>
            <option value="v0.6.7+commit.b8d736ae">v0.6.7+commit.b8d736ae</option>
            <option value="v0.6.6+commit.6c089d02">v0.6.6+commit.6c089d02</option>
            <option value="v0.6.5+commit.f956cc89">v0.6.5+commit.f956cc89</option>
            <option value="v0.6.4+commit.1dca32f3">v0.6.4+commit.1dca32f3</option>
            <option value="v0.6.3+commit.8dda9521">v0.6.3+commit.8dda9521</option>
            <option value="v0.6.2+commit.bacdbe57">v0.6.2+commit.bacdbe57</option>
            <option value="v0.6.1+commit.e6f7d5a4">v0.6.1+commit.e6f7d5a4</option>
            <option value="v0.6.0+commit.26b70077">v0.6.0+commit.26b70077</option>
            <option value="v0.5.17+commit.d19bba13">v0.5.17+commit.d19bba13</option>
            <option value="v0.5.16+commit.9c3226ce">v0.5.16+commit.9c3226ce</option>
            <option value="v0.5.15+commit.6a57276f">v0.5.15+commit.6a57276f</option>
            <option value="v0.5.14+commit.01f1aaa4">v0.5.14+commit.01f1aaa4</option>
            <option value="v0.5.13+commit.5b0b510c">v0.5.13+commit.5b0b510c</option>
            <option value="v0.5.12+commit.7709ece9">v0.5.12+commit.7709ece9</option>
            <option value="v0.5.11+commit.22be8592">v0.5.11+commit.22be8592</option>
            <option value="v0.5.11+commit.c082d0b4">v0.5.11+commit.c082d0b4</option>
            <option value="v0.5.10+commit.5a6ea5b1">v0.5.10+commit.5a6ea5b1</option>
            <option value="v0.5.9+commit.c68bc34e">v0.5.9+commit.c68bc34e</option>
            <option value="v0.5.9+commit.e560f70d">v0.5.9+commit.e560f70d</option>
            <option value="v0.5.8+commit.23d335f2">v0.5.8+commit.23d335f2</option>
            <option value="v0.5.7+commit.6da8b019">v0.5.7+commit.6da8b019</option>
            <option value="v0.5.6+commit.b259423e">v0.5.6+commit.b259423e</option>
            <option value="v0.5.5+commit.47a71e8f">v0.5.5+commit.47a71e8f</option>
            <option value="v0.5.4+commit.9549d8ff">v0.5.4+commit.9549d8ff</option>
            <option value="v0.5.3+commit.10d17f24">v0.5.3+commit.10d17f24</option>
            <option value="v0.5.2+commit.1df8f40c">v0.5.2+commit.1df8f40c</option>
            <option value="v0.5.1+commit.c8a2cb62">v0.5.1+commit.c8a2cb62</option>
            <option value="v0.5.0+commit.1d4f565a">v0.5.0+commit.1d4f565a</option>
            <option value="v0.4.26+commit.4563c3fc">v0.4.26+commit.4563c3fc</option>
            <option value="v0.4.25+commit.59dbf8f1">v0.4.25+commit.59dbf8f1</option>
            <option value="v0.4.24+commit.e67f0147">v0.4.24+commit.e67f0147</option>
            <option value="v0.4.23+commit.124ca40d">v0.4.23+commit.124ca40d</option>
            <option value="v0.4.22+commit.4cb486ee">v0.4.22+commit.4cb486ee</option>
            <option value="v0.4.21+commit.dfe3193c">v0.4.21+commit.dfe3193c</option>
            <option value="v0.4.20+commit.3155dd80">v0.4.20+commit.3155dd80</option>
            <option value="v0.4.19+commit.c4cbbb05">v0.4.19+commit.c4cbbb05</option>
            <option value="v0.4.18+commit.9cf6e910">v0.4.18+commit.9cf6e910</option>
            <option value="v0.4.17+commit.bdeb9e52">v0.4.17+commit.bdeb9e52</option>
            <option value="v0.4.16+commit.d7661dd9">v0.4.16+commit.d7661dd9</option>
            <option value="v0.4.15+commit.8b45bddb">v0.4.15+commit.8b45bddb</option>
            <option value="v0.4.15+commit.bbb8e64f">v0.4.15+commit.bbb8e64f</option>
            <option value="v0.4.14+commit.c2215d46">v0.4.14+commit.c2215d46</option>
            <option value="v0.4.13+commit.0fb4cb1a">v0.4.13+commit.0fb4cb1a</option>
            <option value="v0.4.12+commit.194ff033">v0.4.12+commit.194ff033</option>
            <option value="v0.4.11+commit.68ef5810">v0.4.11+commit.68ef5810</option>
            {/* Add other compiler options here */}
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
            <option value="No License (None)">No License (None)</option>
            <option value="The Unlicense (Unlicense)">The Unlicense (Unlicense)</option>
            <option value="MIT License (MIT)">MIT License (MIT)</option>
            <option value="GNU General Public License v2.0 (GNU GPLv2)">GNU General Public License v2.0 (GNU GPLv2)</option>
            <option value="GNU General Public License v3.0 (GNU GPLv3)">GNU General Public License v3.0 (GNU GPLv3)</option>
            <option value="GNU Lesser General Public License v2.1 (GNU LGPLv2.1)">GNU Lesser General Public License v2.1 (GNU LGPLv2.1)</option>
            <option value="GNU Lesser General Public License v3.0 (GNU LGPLv3)">GNU Lesser General Public License v3.0 (GNU LGPLv3)</option>
            <option value="BSD 2-clause &quot;Simplified&quot; license (BSD-2-Clause)">BSD 2-clause "Simplified" license (BSD-2-Clause)</option>
            <option value="BSD 3-clause &quot;New&quot; Or &quot;Revised&quot; license (BSD-3-Clause)">BSD 3-clause "New" Or "Revised" license (BSD-3-Clause)</option>
            <option value="Mozilla Public License 2.0 (MPL-2.0)">Mozilla Public License 2.0 (MPL-2.0)</option>
            <option value="Open Software License 3.0 (OSL-3.0">Open Software License 3.0 (OSL-3.0)</option>
            <option value="Apache 2.0 (Apache-2.0)">Apache 2.0 (Apache-2.0)</option>
            <option value="GNU Affero General Public License (GNU AGPLv3)">GNU Affero General Public License (GNU AGPLv3)</option>
            <option value="Business Source License (BSL 1.1)">Business Source License (BSL 1.1)</option>
            {/* Add other license options here */}
          </select>
          
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
              disabled={!contractAddress && !compilerType && !walletAddress}
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
"use client"

import Link from 'next/link';
import { useState } from 'react';

const VerifyContractSolcMultiple: React.FC = () => {
    const [contractFiles, setContractFiles] = useState<FileList | null>(null);
    const [runs, setRuns] = useState(200);
    const [evmVersion, setEvmVersion] = useState('default');
    const [licenseType, setLicenseType] = useState('default');

    const [constructorArgs, setConstructorArgs] = useState('');
    const [libraries, setLibraries] = useState<{ name: string; address: string }[]>([]);
    const [optimization, setOptimization] = useState(false);

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContractFiles(e.target.files);
    };

    const handleAddLibrary = () => {
        setLibraries([...libraries, { name: '', address: '' }]);
    };

    const handleLibraryChange = (index: number, field: 'name' | 'address', value: string) => {
        const updatedLibraries = libraries.map((lib, libIndex) =>
            libIndex === index ? { ...lib, [field]: value } : lib
        );
        setLibraries(updatedLibraries);
    };

    const handleVerifyAndPublish = () => {
        console.log("Verify and Publish clicked");
    };

    const handleReset = () => {
        setContractFiles(null);
        setRuns(200);
        setEvmVersion('default');
        setConstructorArgs('');
        setLibraries([]);
        setOptimization(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
            <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Verify & Publish Contract Source Code
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Source code verification provides transparency for users interacting with smart contracts. By uploading the source code, Moonbase will match the compiled code with that on the blockchain. <a href="#" className="text-blue-600 hover:underline">Read more.</a>
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    This is an experimental source code verifier which supports verification of multi-part solidity files (imports).
                </p>

                <ol className="list-decimal list-inside mb-6 text-gray-700 dark:text-gray-300">
                    <li>Enter Contract Details</li>
                    <li>Verify & Publish</li>
                </ol>

                {/* Contract Address, Compiler Type, Compiler Version */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contract Address:</label>
                        <p className="text-gray-800 dark:text-white">0x6c5f7dc7e8fcc4d53f46d52cdde8eb67323d3222</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Compiler Type:</label>
                        <p className="text-gray-800 dark:text-white">SOLIDITY MULTI-PART VERIFIER (IMPORTS)</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Compiler Version:</label>
                        <p className="text-gray-800 dark:text-white">v0.8.24+commit.e11b9ed9</p>
                    </div>
                </div>

                {/* Input Contract code */}
                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Enter the Solidity Contract Code below *
                    </label>
                    <input
                        type="text"
                        multiple
                        onChange={handleFilesChange}
                        className="mt-2 w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">

                    </p>
                </div>

                {/* Upload Contract Files */}
                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Please select the Solidity (*.sol) files for upload *
                    </label>
                    <input
                        type="file"
                        multiple
                        onChange={handleFilesChange}
                        className="mt-2 w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        CTRL click to select Multiple files. Supported file types: .sol
                    </p>
                </div>

                {/* Advanced Configuration */}
                <div className="mt-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Advanced Configuration</h2>

                    <div className="flex items-center">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-4">Optimization</label>
                        <input
                            type="checkbox"
                            checked={optimization}
                            onChange={(e) => setOptimization(e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{optimization ? 'Yes' : 'No'}</span>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Runs (Optimizer)</label>
                        <input
                            type="number"
                            value={runs}
                            onChange={(e) => setRuns(Number(e.target.value))}
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">EVM Version to target</label>
                        <select
                            value={evmVersion}
                            onChange={(e) => setEvmVersion(e.target.value)}
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="default">default (compiler defaults)</option>
                            <option value="istanbul">Istanbul</option>
                            <option value="berlin">Berlin</option>
                            <option value="london">London</option>
                        </select>
                    </div>


                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">License Type</label>
                        {/* <p className="text-gray-800 dark:text-white">10) Mozilla Public License 2.0 (MPL-2.0)</p> */}
                        <select
                            value={evmVersion}
                            onChange={(e) => setLicenseType(e.target.value)}
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="default">default (compiler defaults)</option>
                            <option value="istanbul">1) MIT License (MIT)</option>
                            <option value="istanbul">2) Mozilla Public License 2.0 (MPL-2.0)</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Constructor Arguments ABI-encoded
                        </label>
                        <input
                            type="text"
                            value={constructorArgs}
                            onChange={(e) => setConstructorArgs(e.target.value)}
                            placeholder="For contracts that were created with constructor parameters"
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>


                    {/* Library Addresses */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Contract Library Address (for contracts that use libraries, supports up to 10 libraries)
                        </label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            Note: Library names are case sensitive and affect the keccak library hash
                        </p>
                        <button
                            type="button"
                            onClick={handleAddLibrary}
                            className="px-4 py-2 mb-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                        >
                            Add Library
                        </button>

                        {libraries.map((library, index) => (
                            <div key={index} className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Library Name"
                                    value={library.name}
                                    onChange={(e) => handleLibraryChange(index, 'name', e.target.value)}
                                    className="w-full mt-1 mb-2 px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                <input
                                    type="text"
                                    placeholder="Library Contract Address"
                                    value={library.address}
                                    onChange={(e) => handleLibraryChange(index, 'address', e.target.value)}
                                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        ))}

                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between mt-6">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                    >
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={handleVerifyAndPublish}
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Link href="/contract-address/0x42da36204446083385e59cF8B34B36a3D872731F">Verify and Publish</Link>
                        
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyContractSolcMultiple;

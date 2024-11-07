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
    const [message, setMessage] = useState("");

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

    // Handle text input in <textarea>
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
    }

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
                <div className="space-y-4 bg-[#e9ecef] p-2 rounded-lg border">
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
                    {/* <input
                        type="text"
                        multiple
                        onChange={handleFilesChange}
                        className="mt-2 w-full border border-gray-300 min-h-[200px] rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    /> */}

                    {/* <textarea id="message"  className="block p-2.5 w-full min-h-[200px] text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder=""></textarea> */}
                    <textarea
                        id="contractCode"
                        value={message} // Bind the `message` state here
                        onChange={handleTextChange} // Call `handleTextChange` on each change
                        className="block p-2.5 w-full min-h-[200px] text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder=""
                    ></textarea>
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

                    <div className='lg:flex '>
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

                        <div className='mx-2'>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Runs (Optimizer)</label>
                            <input
                                type="number"
                                value={runs}
                                onChange={(e) => setRuns(Number(e.target.value))}
                                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        <div className='mx-2'>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">EVM Version to target</label>
                            <select
                                value={evmVersion}
                                onChange={(e) => setEvmVersion(e.target.value)}
                                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="default">default (compiler defaults)</option>
                                <option value="homestead">homestead (oldest version)</option>
                                <option value="tangerineWhistle">tangerineWhistle</option>
                                <option value="spuriousDragon">spuriousDragon</option>
                                <option value="byzantium">byzantium (default for &lt;= v0.5.4)</option>
                                <option value="constantinople">constantinople</option>
                                <option value="petersburg">petersburg (default for &gt;= v0.5.5)</option>
                                <option value="istanbul">istanbul (default for &gt;= v0.5.14)</option>
                                <option value="berlin">berlin (default for &gt;= v0.8.5)</option>
                                <option value="london">london (default for &gt;= v0.8.7)</option>
                                <option value="paris">paris (default for &gt;=v0.8.18)</option>
                                <option value="shanghai">shanghai (default for &gt;=v0.8.20)</option>
                                <option value="cancun">cancun (default for &gt;= v0.8.24)</option>
                            </select>
                        </div>
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
                            <option value="1">1) No License (None)</option>
                            <option value="2">2) The Unlicense (Unlicense)</option>
                            <option value="3">3) MIT License (MIT)</option>
                            <option value="4">4) GNU General Public License v2.0 (GNU GPLv2)</option>
                            <option value="5">5) GNU General Public License v3.0 (GNU GPLv3)</option>
                            <option value="6">6) GNU Lesser General Public License v2.1 (GNU LGPLv2.1)</option>
                            <option value="7">7) GNU Lesser General Public License v3.0 (GNU LGPLv3)</option>
                            <option value="8">8) BSD 2-clause "Simplified" license (BSD-2-Clause)</option>
                            <option value="9">9) BSD 3-clause "New" Or "Revised" license (BSD-3-Clause)</option>
                            <option value="10">10) Mozilla Public License 2.0 (MPL-2.0)</option>
                            <option value="11">11) Open Software License 3.0 (OSL-3.0)</option>
                            <option value="12">12) Apache 2.0 (Apache-2.0)</option>
                            <option value="13">13) GNU Affero General Public License (GNU AGPLv3)</option>
                            <option value="14">14) Business Source License (BSL 1.1)</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Constructor Arguments ABI-encoded
                        </label>
                        {/* <input
                            type="text"
                            value={constructorArgs}
                            onChange={(e) => setConstructorArgs(e.target.value)}
                            placeholder="For contracts that were created with constructor parameters"
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        /> */}

                        <textarea
                            id="contractCode"
                            value={message} // Bind the `message` state here
                            onChange={handleTextChange} // Call `handleTextChange` on each change
                            className="block p-2.5 w-full min-h-[150px] text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder=""
                        ></textarea>

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

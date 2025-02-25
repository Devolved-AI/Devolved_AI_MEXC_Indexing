"use client"

import { useState, useEffect } from 'react';
import Cookies from "js-cookie";
import { verify_contract } from "@/app/var";
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then(mod => mod.Player), { ssr: false });
import LoadinJson from '../../../../public/block.json';

const VerifyContractSolcMultiple: React.FC = () => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [contractAddress, setContractAddress] = useState('');
    const [compilerVersion, setCompilerVersion] = useState('');
    const [contractFiles, setContractFiles] = useState<FileList | null>(null);
    const [licenseType, setLicenseType] = useState('');
    const [optimization, setOptimization] = useState(false);
    const [runs, setRuns] = useState(0);
    const [evmVersion, setEvmVersion] = useState('');
    const [constructorArgs, setConstructorArgs] = useState('');
    const [types, setTypes] = useState('');
    const [values, setValues] = useState('');
    const [libraries, setLibraries] = useState<{ name: string; address: string }[]>([]);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [message, setMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState('');
    const [showMessageScreen, setShowMessageScreen] = useState(false); // Toggle message screen

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

    const handleVerifyAndPublish = async () => {
        console.log("Step 1: Starting verification process");
        setLoading(true);
        try {
            if (!contractFiles || !contractFiles[0]) {
                toast.error("Please select a Solidity file to upload.");
                return;
            }

            console.log("Step 2: Preparing form data");
            const formData = new FormData();
            formData.append("walletAddress", walletAddress);
            formData.append("contractAddress", contractAddress);
            formData.append("compilerVersion", compilerVersion);
            formData.append("solidityFile", contractFiles[0]);
            formData.append("license", licenseType);
            formData.append("sourceCodeOptimized", optimization.toString());
            formData.append("runsOptimizer", runs.toString());
            formData.append("evmVersionToTarget", evmVersion);
            const constructorArgsArray = constructorArgs.split(",").map(arg => arg.trim());
            formData.append("constructorArgs", JSON.stringify(constructorArgsArray));
            const libraryNames = libraries.map(library => library.name);
            const libraryAddresses = libraries.map(library => library.address);
            formData.append("libraryName", JSON.stringify(libraryNames));
            formData.append("libraryAddress", JSON.stringify(libraryAddresses));
            // formData.append("types", types);
            // formData.append("values", values);
            console.log("Step 3: Fetching access token");
            const accessToken = Cookies.get("access_token");
            if (!accessToken) {
                console.error("Error: Access token not found.");
                toast.error("Access token is missing.");
                return;
            }

            console.log("Step 3: Verifying FormData entries");
            // Log each key-value pair in formData using getAll for each key
            formData.forEach((value, key) => {
                console.log(`${key}: ${value}`);
            });

            // Log each key-value pair in formData for inspection
            console.log("Step 4: Verifying FormData entries");
            // Log each key-value pair in formData using getAll for each key
            formData.forEach((value, key) => {
                console.log(`${key}: ${value}`);
            });

            console.log("Step 5: Making API request");
            const response = await fetch(verify_contract, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                body: formData
            });

            const res = await response.json();

            console.log("Step 6: API response received", res);

            if (res.success) {
                toast.success(res.message || "Contract verified and published successfully!");
                setShowMessageScreen(true); // Show message screen on success
                // router.push('/myverify_address');
            } else {
                toast.error(res.message || "Failed to verify contract. Please try again.");
            }
        } catch (error) {
            console.error("Verification error:", error);
            toast.error("An error occurred while verifying the contract.");
        } finally {
            setLoading(false);
            console.log("Step 7: Verification process complete");
        }
    };

    const handleReset = () => {
        setContractFiles(null);
        setRuns(200);
        setEvmVersion('default');
        setConstructorArgs('');
        setLibraries([]);
        setOptimization(false);

    };

    // Load data from local storage on component mount
    useEffect(() => {
        console.log("Step 0: Loading data from local storage");
        const storedContractAddress = localStorage.getItem('contractAddress');
        const storedCompilerVersion = localStorage.getItem('compilerVersion');
        const storedLicenseType = localStorage.getItem('licenseType');
        const storedWalletAddress = localStorage.getItem('walletAddress');

        if (storedContractAddress) setContractAddress(storedContractAddress);
        if (storedCompilerVersion) setCompilerVersion(storedCompilerVersion);
        if (storedLicenseType) setLicenseType(storedLicenseType);
        if (storedWalletAddress) setWalletAddress(storedWalletAddress);
    }, []);

    // Handle text input in <textarea>
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setConstructorArgs(e.target.value);
    }

    if (loading) {
        return (
            <div className="p-4 bg-white text-gray-700 shadow rounded-md">
                <div className="flex justify-center items-center h-64">
                    <Player autoplay loop src={LoadinJson} style={{ height: '150px', width: '150px' }} />
                </div>
            </div>
        );
    }

    const handleRemoveLibrary = (index: number) => {
        setLibraries(libraries.filter((_, libIndex) => libIndex !== index));
    };


    // Define the custom SVG icon component
    const CircleXMarkIcon = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
        >
            <path
                fillRule="evenodd"
                d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2ZM9.97 8.97a.75.75 0 0 1 1.06 0L12 9.94l.97-.97a.75.75 0 0 1 1.06 1.06L13.06 11l.97.97a.75.75 0 0 1-1.06 1.06L12 12.06l-.97.97a.75.75 0 1 1-1.06-1.06L10.94 11l-.97-.97a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
            />
        </svg>
    );


    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">

            {showMessageScreen ? (
                // Message screen content
                <div className='max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6'>
                    <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Contract verified and published</h2>
                    <p className="mt-4 text-sm p-2 bg-[#011a27] border-[#044f75] border-2 rounded-lg text-[#6edff6] dark:text-[#6edff6] text-center">
                        You've successfully Contract verified and published !.
                    </p>
                </div>
            ) : (
                <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                        Verify & Publish Contract Source Code
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Source code verification provides transparency and builds trust for users interacting with smart contracts on ArgoChain. By uploading your source code, ArgoChain will match the compiled bytecode with the one deployed on the blockchain, ensuring that the contract's code is authentic and unaltered. This process allows users to verify the integrity of smart contracts, fostering confidence in the platform.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                        This is an experimental source code verifier which supports verification of multi-part solidity files (imports).
                    </p>

                    <ol className="list-decimal list-inside mb-6 text-gray-700 dark:text-gray-300">
                        <li>Enter Contract Details</li>
                        <li>Verify & Publish</li>
                    </ol>

                    {/* Contract Address, Compiler Type, Compiler Version */}
                    <div className="space-y-4 bg-[#e9ecef] dark:bg-gray-700 p-2 rounded-lg border">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Wallet Address:</label>
                            <p className="text-gray-800 dark:text-white">{walletAddress}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contract Address:</label>
                            <p className="text-gray-800 dark:text-white">{contractAddress}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Compiler Version:</label>
                            <p className="text-gray-800 dark:text-white">{compilerVersion}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">License Type:</label>
                            <p className="text-gray-800 dark:text-white">{licenseType}</p>
                        </div>

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
                                    <option value="">Please Select</option>
                                    <option value="homestead">homestead</option>
                                    <option value="tangerineWhistle">tangerineWhistle</option>
                                    <option value="spuriousDragon">spuriousDragon</option>
                                    <option value="byzantium">byzantium</option>
                                    <option value="constantinople">constantinople</option>
                                    <option value="petersburg">petersburg</option>
                                    <option value="istanbul">istanbul</option>
                                    <option value="berlin">berlin</option>
                                    <option value="london">london</option>
                                    <option value="paris">paris</option>
                                    <option value="shanghai">shanghai</option>
                                </select>
                            </div>
                        </div>


                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">License Type</label>
                            {/* <p className="text-gray-800 dark:text-white">10) Mozilla Public License 2.0 (MPL-2.0)</p> */}
                            <select
                                value={licenseType}
                                onChange={(e) => setLicenseType(e.target.value)}
                                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Constructor Arguments ABI-encoded
                            </label>
                            <textarea
                                id="contractCode"
                                value={constructorArgs} // Bind the `message` state here
                                onChange={handleTextChange} // Call `handleTextChange` on each change
                                className="block p-2.5 w-full min-h-[150px] text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder=""
                            ></textarea>

                        </div>

                        <div className="mt-6 space-y-4">

                            <div className='lg:flex '>
                                <div className='mx-2'>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Types</label>
                                    <input
                                        type="types"
                                        value={types}
                                        onChange={(e) => setTypes(e.target.value)}
                                        className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                <div className='mx-2'>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Values</label>
                                    <input
                                        type="values"
                                        value={values}
                                        onChange={(e) => setValues(e.target.value)}
                                        className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>


                        {/* Library Addresses */}
                        {/* <div>
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

                    </div> */}




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
                                <div key={index} className="relative mb-4 flex items-center w-full">
                                    <div className="w-11/12">
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
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveLibrary(index)}
                                        className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 focus:outline-none"
                                    >
                                        <CircleXMarkIcon />
                                    </button>
                                </div>
                            ))}
                        </div>



                    </div>



                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                    >
                        Reset
                    </button>

                    {/* Buttons */}
                    <div className="flex justify-between mt-2">
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            ← Back
                        </button>
                        <button
                            type="button"
                            onClick={handleVerifyAndPublish}
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Verify and Publish

                        </button>
                    </div>
                </div>
            )
            }

        </div>
    );
};

export default VerifyContractSolcMultiple;
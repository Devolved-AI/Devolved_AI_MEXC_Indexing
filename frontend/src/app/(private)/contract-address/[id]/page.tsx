"use client";

import React, { useState } from "react";

const AddressDetails: React.FC = () => {
  // State to manage active section
  const [activeSection, setActiveSection] = useState("transactions");

  const [activeTab, setActiveTab] = useState("code");

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Contract</h1>
          <p className="text-blue-500 text-lg font-mono break-all mt-2">
            0x42da36204446083385e59cF8B34B36a3D872731F
          </p>
        </div>

        {/* Information Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Overview Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Overview</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">DEV Balance</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">0 DEV</p>
          </div>

          {/* More Info Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">More Info</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Contract Creator</p>
            <p className="text-blue-500 font-mono break-all">0xa08005c5...DaBDdDA23</p>
            <p className="mt-4 text-gray-600 dark:text-gray-400">at txn</p>
            <p className="text-blue-500 font-mono break-all">0x66c6c54113844b69a7c4a6888f937a76a76ccc314a06b054524d6951cd2419d2</p>
          </div>

          {/* Multichain Info Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Multichain Info</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">N/A</p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex space-x-6 mb-4">
          <h2
            className={`text-lg font-semibold cursor-pointer ${activeSection === "transactions"
                ? "text-gray-800 dark:text-white"
                : "text-gray-600 dark:text-gray-400"
              }`}
            onClick={() => setActiveSection("transactions")}
          >
            Transactions
          </h2>
          <h2
            className={`text-lg font-semibold cursor-pointer ${activeSection === "contract"
                ? "text-gray-800 dark:text-white"
                : "text-gray-600 dark:text-gray-400"
              }`}
            onClick={() => setActiveSection("contract")}
          >
            Contract
          </h2>
        </div>

        {/* Conditional Rendering for Sections */}
        {activeSection === "transactions" && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Transactions</h2>
              <button className="text-blue-600 dark:text-blue-400 hover:underline">
                Download: CSV Export
              </button>
            </div>

            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Transaction Hash
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Block
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    To
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Txn Fee
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr className="hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="px-4 py-4 text-sm text-blue-500 font-mono break-all">
                    0x66c6c...cd2419d2
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">0x60c06040</td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">9296842</td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">2 days ago</td>
                  <td className="px-4 py-4 text-sm text-blue-500 font-mono break-all">0xa08005c5...DaBDdDA23</td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">Create: HelloWorld</td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">0 DEV</td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">0.00002873</td>
                </tr>
                {/* Add more rows as needed */}
              </tbody>
            </table>
          </div>
        )}

        {activeSection === "contract" && (
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Tab Navigation */}
              {/* <div className="flex space-x-4 border-b border-gray-300 dark:border-gray-700">
              {["Code", "Read Contract", "Write Contract", "Search Source Code"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSection(tab.toLowerCase())}
                  className={`px-4 py-2 text-sm font-semibold ${
                    activeSection === tab.toLowerCase()
                      ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div> */}

              {/* Code Tab */}
              {activeSection === "contract" && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                    Contract Source Code Verified (Exact Match)
                  </h2>

                  {/* Contract Details */}
                  <div className="space-y-4">
                    {/* <div className="flex">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Contract Name:</span>
                    <p className="text-gray-800 dark:text-white">HelloWorld</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Compiler Version:</span>
                    <p className="text-gray-800 dark:text-white">v0.8.24+commit.e11b9ed9</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Optimization Enabled:</span>
                    <p className="text-gray-800 dark:text-white">Yes with 200 runs</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Other Settings:</span>
                    <p className="text-gray-800 dark:text-white">Shanghai EVM Version, MIT license</p>
                  </div>
                  </div> */}


                    <div className="space-y-4 bg-[#e9ecef] p-2 rounded-lg border rounded-lg shadow-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contract Name:</label>
                        <p className="text-gray-800 dark:text-white">HelloWorld</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Optimization Enabled:</label>
                        <p className="text-gray-800 dark:text-white">Yes with 200 runs</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Compiler Version:</label>
                        <p className="text-gray-800 dark:text-white">v0.8.24+commit.e11b9ed9</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Other Settings:</label>
                        <p className="text-gray-800 dark:text-white">shanghai EvmVersion, MIT license</p>
                      </div>
                    </div>



                    {/* Contract Source Code */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mt-6">Contract Source Code (Solidity)</h3>
                      <pre className="bg-gray-100 dark:bg-gray-700 p-4 h-40 rounded-md text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                        {"// Solidity code here..."}
                      </pre>
                    </div>

                    {/* Contract ABI */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mt-6">Contract ABI</h3>
                      <pre className="bg-gray-100 dark:bg-gray-700 p-4 h-60 rounded-md text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                        
                      </pre>
                    </div>

                    {/* Contract Creation Code */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mt-6">Contract Creation Code</h3>
                      {/* <pre className="bg-gray-100 dark:bg-gray-700 p-4 h-60 rounded-md text-sm text-gray-800 dark:text-gray-200 overflow-y-auto overflow-auto">
                      60c0604052600b60809081526a12195b1b1bc815dbdc9b1960aa1b60a0525f9061002990826100d3565b503480156 10035575f80fd5b50610192565b634e487b7160e01b5f52604160045260245ffd5b600181811c908216806100 6357607f821691505b60208210810361008157634e487b7160e01b5f52602260045260245ffd5b50919050565b601f8211156100ce57805f5260205f20601f840160051c810160208510156100ac5750805b601f840160051c820191505b818110156100cb575f81556001016100b8565b50505b505050565b81516001600160401b038111156100ec576100ec61003b565b610100816100fa845461004f565b84610087565b602080601f831160018114610133575f841561011c5750858301515b5f19600386901b1c1916600185901b17855561018a565b5f85815260208120601f198616915b8281101561016157888601518255948401946001909101908401610142565b508582101561017e57878501515f19600388901b60f8161c191681555b505060018460011b0185555b505050505050565b6101908061019f5f395ff3fe608060405234801561000f575f80fd5b5060043610610029575f3560e01c8063cfae32171461002d575b5f80fd5b61003561004b565b60405161004291906100d6565b60405180910390f35b5f805461005790610122565b80601f016020809104026020016040519081016040528092919081815260200182805461008390610122565b80156100ce5780601f106100a5576101008083540402835291602001916100ce565b820191905f5260205f20905b8154815290600101906020018083116100b157829003601f168201915b505050505081565b5f602080835283518060208501525f5b81811015610102578581018301518582016040015282016100e6565b505f604082860101526040601f19601f8301168501019250505092915050565b600181811c9082168061013657607f821691505b60208210810361015457634e487b7160e01b5f52602260045260245ffd5b5091905056fea2646970667358221220329a07137b57d151a82ebfdf23fda31c31397adbde06893661c3405ca219472664736f6c63430008180033
                      </pre> */}
                      <p className="bg-gray-100 dark:bg-gray-700 p-4 h-60 rounded-md text-sm text-gray-800 dark:text-gray-200 overflow-y-auto overflow-auto">
                      60c0604052600b60809081526a12195b1b1bc815dbdc9b1960aa1b60a0525f9061002990826100d3565b50348015610035575f80fd5b50610192565b634e 45260245ffd5b50919050565b601f8211156100ce57805f5260205f20601f840160051c810160208510156100ac5750805b601f840160051c820191505b 818110156100cb575f81556001016100b8565b50505b505050565b81516001600160401b038111156100ec576100ec61003b565b610100816100fa84546 1004f565b84610087565b602080601f831160018114610133575f841561011c5750858301515b5f19600386901b1c1916600185901b17855561018a565b 5f85815260208120601f198616915b8281101561016157888601518255948401946001909101908401610142565b508582101561017e57878501515f196 00388901b60f8161c191681555b505060018460011b0185555b505050505050565b6101908061019f5f395ff3fe608060405234801561000f575f80fd5b 5060043610610029575f3560e01c8063cfae32171461002d575b5f80fd5b61003561004b565b60405161004291906100d6565b60405180910390f35b5f 805461005790610122565b80601f016020809104026020016040519081016040528092919081815260200182805461008390610122565b80156100ce578 0601f106100a5576101008083540402835291602001916100ce565b820191905f5260205f20905b8154815290600101906020018083116100b15782900 3601f168201915b505050505081565b5f602080835283518060208501525f5b81811015610102578581018301518582016040015282016100e6565b505f 604082860101526040601f19601f8301168501019250505092915050565b600181811c9082168061013657607f821691505b60208210810361015457634 e487b7160e01b5f52602260045260245ffd5b5091905056fea2646970667358221220329a07137b57d151a82ebfdf23fda31c31397adbde06893661c340 5ca219472664736f6c63430008180033487b7160e01b5f52604160045260245ffd5b600181811c9082168061006357607f821691505b60208210810361008157634e487b7160e01b5f526022600 
                      </p>
                    </div>

                    {/* Deployed Bytecode */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mt-6">Deployed Bytecode</h3>
                      <pre className="bg-gray-100 dark:bg-gray-700 p-4 h-20 rounded-md text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                        0x608060405234801561000f575f80fd5b5060043610610029575f3560e01c8063cfae32171461002
                      </pre>
                    </div>

                    {/* Deployed Bytecode Sourcemap */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mt-6">Deployed Bytecode Sourcemap</h3>
                      <pre className="bg-gray-100 dark:bg-gray-700 p-4 h-20 rounded-md text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                        61:66:0:-:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;88:35;;;:::i;:::-;;;;;;;:::i;:::-;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;
                      </pre>
                    </div>

                    {/* Swarm Source */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mt-6">Swarm Source</h3>
                      <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                        ipfs://329a07137b57d151a82ebfdf23fda31c31397adbde06893661c3405ca2194726
                      </pre>
                      {/* <p className="text-blue-600 dark:text-blue-400">
                      
                    </p> */}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressDetails;

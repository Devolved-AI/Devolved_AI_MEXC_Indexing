import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import BlockImage from '../../../public/icon-block.png';
import TransactionImage from '../../../public/transactions-icon.png';
import Link from 'next/link';
import dynamic from 'next/dynamic'; // For Lottie
import LoadinJson from '../../../public/block.json'; // Your Lottie JSON file

// Dynamically import the Lottie player
const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then(mod => mod.Player), {
  ssr: false,
});

interface Block {
  block_number: string;
  timestamp: string;
  block_hash: string;
  parent_hash: string;
  extrinsics_root: string;
}

interface Transaction {
  tx_hash: string;
  amount: string;
  from_address: string;
  to_address: string;
  block_number: string;
  method: string;
  gas_fee: string;
  fee: string;
}

const HomeSection: React.FC = () => {
  const [latestBlocks, setLatestBlocks] = useState<Block[]>([]);
  const [latestTransactions, setLatestTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch latest blocks and transactions in parallel
    const fetchData = async () => {
      try {
        setLoading(true); // Start loading

        const [blocksResponse, transactionsResponse] = await Promise.all([
          fetch(process.env.NEXT_PUBLIC_BASE_URL + '/block/getLast10Blocks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }),
          fetch(process.env.NEXT_PUBLIC_BASE_URL + '/transaction/getLast10Transactions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }),
        ]);

        const blocksData = await blocksResponse.json();
        const transactionsData = await transactionsResponse.json();

        if (blocksData.blocks) {
          setLatestBlocks(blocksData.blocks);
        }

        if (transactionsData.transactions) {
          setLatestTransactions(transactionsData.transactions);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false); // Stop loading once data is fetched
      }
    };

    fetchData();
  }, []);

  const shorten = (hash: string) => `${hash.slice(0, 4)}...${hash.slice(-5)}`;

  const formatTimestamp = (timestamp: any) => {
    // Create a new Date object from the timestamp string
    const date = new Date(timestamp);
  
    // Use Intl.DateTimeFormat for formatting without the timezone part
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  };

  if (loading) {
    // Show the Lottie animation while loading
    return (
      <div className="flex justify-center items-center h-64">
        <Player
          autoplay
          loop
          src={LoadinJson}
          style={{ height: '150px', width: '150px' }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-6 lg:pt-20">
      {/* Latest Blocks and Transactions Sections */}
      <div className="flex flex-col md:flex-row justify-between space-y-8 md:space-y-0 md:space-x-8">
        {/* Latest Blocks Section */}
        <div className="w-full md:w-1/2 overflow-auto">
          <h2 className="text-xl font-semibold mb-4">Latest Blocks</h2>
          <div className="bg-white shadow-md rounded-lg p-4 overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8 h-8">
                    Icon
                  </th>
                  <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Block Number
                  </th>
                  <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {latestBlocks.map((block, index) => (
                  <tr key={index}>
                    <td className="px-5 py-7 bg-gray-100 text-xs sm:text-sm text-gray-500 h-4 w-4">
                      <Image priority src={BlockImage} alt="block-icon" />
                    </td>
                    <td className="px-4 py-6 text-xs sm:text-sm text-[#D91A9C]">
                      <Link href={`/blocks/${block.block_number}`} className="text-[#D91A9C] hover:underline">
                        {block.block_number}
                      </Link>
                    </td>
                    <td className="px-4 py-6 text-xs sm:text-sm text-[#D91A9C]">{formatTimestamp(block.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Transactions Section */}
        <div className="w-full md:w-1/2 overflow-auto">
          <h2 className="text-xl font-semibold mb-4">Latest Transactions</h2>
          <div className="bg-white shadow-md rounded-lg p-4 overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Icon
                  </th>
                  <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Txn Hash
                  </th>
                  <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    To
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {latestTransactions.map((txn, index) => (
                  <tr key={index}>
                    <td className="px-5 py-7 bg-gray-100 text-xs sm:text-sm text-gray-500 h-4 w-4">
                      <Image priority src={TransactionImage} alt="transaction-icon" />
                    </td>
                    <td className="px-4 py-6 text-xs sm:text-sm text-[#D91A9C]">
                      <Link href={`/transactions/${txn.tx_hash}`} className="text-[#D91A9C] hover:underline">
                        {shorten(txn.tx_hash)}
                      </Link>
                    </td>
                    <td className="px-4 py-6 text-xs sm:text-sm text-[#D91A9C]">
                      <Link href={`/address/${txn.from_address}`} className="text-[#D91A9C] hover:underline">
                        {shorten(txn.from_address)}
                      </Link>
                    </td>
                    <td className="px-4 py-6 text-xs sm:text-sm text-[#D91A9C]">
                      <Link href={`/address/${txn.to_address}`} className="text-[#D91A9C] hover:underline">
                        {shorten(txn.to_address)}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSection;

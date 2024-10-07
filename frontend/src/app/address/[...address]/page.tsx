"use client";

import React, { useState, useEffect } from 'react';
import ClipboardJS from 'clipboard';
import { FiClipboard } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic'; // Import dynamic for client-side rendering
const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then(mod => mod.Player), {
  ssr: false,
});
import LoadinJson from '../../../../public/block.json';

interface Transaction {
  tx_hash: string;
  block_number: string;
  timestamp: string;
  from_address: string;
  to_address: string;
  amount: string;
  gas_fee: string;
}

const TransactionDetailsByAddress = () => {
  const [transactionData, setTransactionData] = useState<Transaction[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [balance, setBalance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const address = pathname?.split('/').pop();

  useEffect(() => {
    // Initialize ClipboardJS
    const clipboard = new ClipboardJS('.copy-btn');
    
    clipboard.on('success', function(e) {
      console.log(e);
    });
    
    clipboard.on('error', function(e) {
      console.log(e);
    });

    return () => {
      clipboard.destroy();
    };
  }, []);

  useEffect(() => {
    if (address) {
      fetchTransactionDetails(address);
      fetchBalance(address);
    }
  }, [address]);

  const fetchTransactionDetails = async (address: string) => {
    try {
      setLoading(true);
      const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/transaction/getTransactionDetailsByAddress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();
      if (data.success) {
        setTransactionData(data.transactions);
        setError(null);
      } else {
        setTransactionData(null);
        setError('Transaction not found.');
      }
    } catch (err) {
      setTransactionData(null);
      setError('Transaction not found or an error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async (address: string) => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/transaction/getBalance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();
      if (data.success) {
        setBalance(data.balance);
        setError(null);
      } else {
        setBalance('Balance not found');
      }
    } catch (err) {
      setBalance('Balance not found');
      setError('Balance not found or an error occurred.');
    }
  };

  const convertTo18Precision = (amount: string) => {
    return (parseFloat(amount) / 1e18).toFixed(18);
  };

  const formatTimestamp = (timestamp: any) => {
    const date = new Date(timestamp);
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
    return (
      <div className="p-4 bg-white text-gray-700 shadow">
        <div className="flex justify-center items-center h-64">
          <div className="loader">
            <Player
              autoplay
              loop
              src={LoadinJson}
              style={{ height: '150px', width: '150px' }}
            />
          </div>
        </div>
      </div>
    );
  }

  if ((!balance && !transactionData ) || error) {
    return (
      <div className="p-4 bg-white text-gray-700 shadow text-center">
        <h1 className="text-4xl font-bold text-red-500">404</h1>
        <p className="mt-2 text-gray-600">The balance and transaction details for the specified address were not found.</p>
        <Link href="/" className="text-[#D91A9C] hover:underline mt-4 inline-block">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {balance && (
        <div className="text-center mb-4">
          <h4 className="text-md sm:text-md font-medium mb-4">{balance !== 'Balance not found' ? `Balance: ${convertTo18Precision(balance)} AGC` : 'Balance not found'}</h4>
        </div>
      )}

      {transactionData ? (
        <div className="mt-6">
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Transaction Details</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Hash</th>
                    <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block Number</th>
                    <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                    <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From Address</th>
                    <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To Address</th>
                    <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Fee</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactionData.map((transaction: Transaction, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-sm text-gray-500">
                        <Link href={`/transactions/${transaction.tx_hash}`} className="hover:underline">
                          {transaction.tx_hash.slice(0, 10) + '...' + transaction.tx_hash.slice(-5)}
                        </Link>
                        <button className="ml-2 copy-btn bg-[#D91A9C] text-white hover:bg-[#e332ab] px-2 py-1 rounded" 
                          data-clipboard-text={transaction.tx_hash}
                          title="Copy txhash to clipboard">
                          <FiClipboard />
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link href={`/blocks/${transaction.block_number}`} className="hover:underline">
                          {transaction.block_number}
                        </Link>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatTimestamp(transaction.timestamp)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link href={`/address/${transaction.from_address}`} className="hover:underline">
                          {transaction.from_address.slice(0, 10) + '...' + transaction.from_address.slice(-5)}
                        </Link>
                        <button className="ml-2 copy-btn bg-[#D91A9C] text-white hover:bg-[#e332ab] px-2 py-1 rounded" 
                          data-clipboard-text={transaction.from_address}
                          title="Copy from address to clipboard">
                          <FiClipboard />
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link href={`/address/${transaction.to_address}`} className="hover:underline">
                          {transaction.to_address.slice(0, 10) + '...' + transaction.to_address.slice(-5)}
                        </Link>
                        <button className="ml-2 copy-btn bg-[#D91A9C] text-white hover:bg-[#e332ab] px-2 py-1 rounded" 
                          data-clipboard-text={transaction.to_address}
                          title="Copy to address to clipboard">
                          <FiClipboard />
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{convertTo18Precision(transaction.amount)} AGC</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{convertTo18Precision(transaction.gas_fee)} AGC</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-red-500 mt-6">Transaction details not found.</div>
      )}
    </div>
  );
};

export default TransactionDetailsByAddress;

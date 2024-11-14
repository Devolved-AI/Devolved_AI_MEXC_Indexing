"use client";

import React, { useState, useEffect } from 'react';
import ClipboardJS from 'clipboard';
import { FiClipboard } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then(mod => mod.Player), { ssr: false });
import LoadinJson from '../../../../../public/block.json';

interface Transaction {
  tx_hash: string;
  from_address: string;
  to_address: string;
  amount: string;
  gas_fee: string;
  method: string;
  methodName?: string;
}

interface Block {
  block_number: string;
  timestamp: string;
  transactions: Transaction[];
}

const ITEMS_PER_PAGE = 20;

const TransactionDetailsByAddress = () => {
  const [transactionData, setTransactionData] = useState<Block[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [balance, setBalance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pathname = usePathname();
  const address = pathname?.split('/').pop();

  useEffect(() => {
    const clipboard = new ClipboardJS('.copy-btn');
    clipboard.on('success', e => console.log(e));
    clipboard.on('error', e => console.log(e));
    return () => clipboard.destroy();
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();
      if (data.success) {
        const blocksWithMethodName = data.blocks.map((block: Block) => ({
          ...block,
          transactions: block.transactions.map(transaction => ({
            ...transaction,
            methodName: transaction.method.split('.').pop() || '',
          })),
        }));
        setTransactionData(blocksWithMethodName.reverse());
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const data = await response.json();
      setBalance(data.success ? data.balance : 'Balance not found');
    } catch (err) {
      setBalance('Balance not found');
      setError('Balance not found or an error occurred.');
    }
  };

  const convertToFixedPrecision = (amount: string, decimals = 18) => {
    try {
      const balanceBigInt = BigInt(amount); // Convert amount to BigInt
      const divisor = BigInt(1e18);
      const integerPart = balanceBigInt / divisor;
      const fractionalPart = balanceBigInt % divisor;

      // Calculate fractional part as a string with necessary precision
      let fractionalStr = fractionalPart.toString().padStart(18, '0').slice(0, decimals);

      // Remove trailing zeros from fractional part
      fractionalStr = fractionalStr.replace(/0+$/, '');

      // Return the result with fractional part only if it has significant digits
      return fractionalStr ? `${integerPart}.${fractionalStr}` : integerPart.toString();
    } catch (error) {
        console.error("Invalid input for conversion:", error);
        return '0.0'; // Default value if input is invalid
    }
  };

  const formatTimestamp = (timestamp: string) => {
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

  const paginateData = () => {
    if (!transactionData) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return transactionData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const handleNextPage = () => {
    if (transactionData && currentPage * ITEMS_PER_PAGE < transactionData.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 dark:text-gray-300 text-gray-700 shadow rounded-md">
        <div className="flex justify-center items-center h-64">
          <Player autoplay loop src={LoadinJson} style={{ height: '150px', width: '150px' }} />
        </div>
      </div>
    );
  }

  if ((!balance && !transactionData) || error) {
    return (
      <div className="p-4 bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300 shadow rounded-md text-center">
        <h1 className="text-4xl font-bold text-red-500">404</h1>
        <p className="mt-2 text-gray-600">The balance and transaction details for the specified address were not found.</p>
        <Link href="/" className="text-[#D91A9C] hover:underline mt-4 inline-block">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className=" dark:bg-gray-800 dark:text-gray-300 ">
      <div className='container mx-auto p-4 sm:p-6 lg:p-8'>
      {balance && (
        <div className="text-center mb-6 dark:text-gray-300">
          <h4 className="text-lg sm:text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
            {balance !== 'Balance not found' ? `Balance: ${convertToFixedPrecision(balance)} AGC` : 'Balance not found'}
          </h4>
        </div>
      )}

      {transactionData ? (
        <div className="space-y-6 ">
          {paginateData().map((block, blockIndex) => (
            <div key={blockIndex} className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 shadow-md rounded-lg p-6">
              <div className="mb-4 border-b pb-4">
                <h5 className="text-lg font-semibold ">Block #{block.block_number}</h5>
                <p className="text-gray-500 ">{formatTimestamp(block.timestamp)}</p>
              </div>

              {block.transactions.map((transaction, txIndex) => (
                <div
                  key={txIndex}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border-b last:border-b-0"
                >
                  <div className="col-span-1">
                    <span className="text-gray-500 dark:text-gray-300 font-semibold">Transaction</span>
                    <div className="flex items-center space-x-2">
                      <button
                        className="copy-btn bg-pink-500 text-white p-2 rounded hover:bg-pink-600 transition duration-150 ease-in-out"
                        data-clipboard-text={transaction.tx_hash}
                        title="Copy txhash to clipboard"
                      >
                        <FiClipboard />
                      </button>
                      <Link href={`/tx/${transaction.tx_hash}`} className="hover:underline text-pink-600">
                        {transaction.tx_hash.slice(0, 10)}...{transaction.tx_hash.slice(-5)}
                      </Link>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <span className="text-gray-500 dark:text-gray-300 font-semibold">Method</span>
                    <p className="text-gray-700">{transaction.methodName}</p>
                  </div>
                  <div className="col-span-1">
                    <span className="text-gray-500 dark:text-gray-300 font-semibold">From</span>
                    <div className="flex items-center space-x-2">
                      <button
                        className="copy-btn bg-pink-500 text-white p-2 rounded hover:bg-pink-600 transition duration-150 ease-in-out"
                        data-clipboard-text={transaction.from_address}
                        title="Copy from address to clipboard"
                      >
                        <FiClipboard />
                      </button>
                      <Link href={`/address/${transaction.from_address}`} className="hover:underline text-pink-600">
                        {transaction.from_address.slice(0, 10)}...{transaction.from_address.slice(-5)}
                      </Link>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <span className="text-gray-500 dark:text-gray-300 font-semibold">To</span>
                    <div className="flex items-center space-x-2">
                      <button
                        className="copy-btn bg-pink-500 text-white p-2 rounded hover:bg-pink-600 transition duration-150 ease-in-out"
                        data-clipboard-text={transaction.to_address}
                        title="Copy to address to clipboard"
                      >
                        <FiClipboard />
                      </button>
                      <Link href={`/address/${transaction.to_address}`} className="hover:underline text-pink-600">
                        {transaction.to_address.slice(0, 10)}...{transaction.to_address.slice(-5)}
                      </Link>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <span className="text-gray-500 dark:text-gray-300 font-semibold">Amount</span>
                    <p className="text-gray-700">{convertToFixedPrecision(transaction.amount)} AGC</p>
                  </div>
                  <div className="col-span-1">
                    <span className="text-gray-500 dark:text-gray-300 font-semibold">Gas Fee</span>
                    <p className="text-gray-700">{convertToFixedPrecision(transaction.gas_fee)} AGC</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div className="flex justify-between items-center p-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="bg-pink-500 text-white px-4 py-2 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">Page {currentPage}</span>
            <button
              onClick={handleNextPage}
              disabled={transactionData && currentPage * ITEMS_PER_PAGE >= transactionData.length}
              className="bg-pink-500 text-white px-4 py-2 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-red-500 mt-6">Transaction details not found.</div>
      )}
      </div>
    </div>
  );
};

export default TransactionDetailsByAddress;

"use client";

import React, { useState, useEffect } from 'react';
import ClipboardJS from 'clipboard';
import { FiClipboard } from 'react-icons/fi';
import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import PageLayout from '../../../components/PageLayout';

// Dynamically import the Player component for client-side rendering only
const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then(mod => mod.Player), {
  ssr: false,
});
import LoadinJson from '../../../../../public/block.json';

interface BlockEVM {
  blockNumber: string;
  transactionHash: string;
  from: string;
  to: string;
  gasFee: string;
  amount: string;
  timestamp: string;
}

interface Transaction {
  tx_hash: string;
  from_address: string;
  to_address: string;
  amount: string;
  gas_fee: string;
  block_number: number;
  timestamp: string;
  method: string;
  events: any[] | null;
  status: string;
}

const TransactionDetails = () => {
  const [transactionData, setTransactionData] = useState<Transaction | null>(null);
  const [blockDataEVM, setBlockDataEVM] = useState<BlockEVM[]>([]);
  const [transactionDataBlockHash, setTransactionDataBlockHash] = useState<any>(null);
  const [transactionMessage, setTransactionMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const txnHash = pathname?.split('/').pop();
  const router = useRouter();

  useEffect(() => {
    // Initialize ClipboardJS
    const clipboard = new ClipboardJS('.copy-btn');

    clipboard.on('success', function (e) {
      console.log(e);
    });

    clipboard.on('error', function (e) {
      console.log(e);
    });

    // Cleanup
    return () => {
      clipboard.destroy();
    };
  }, []);

  useEffect(() => {
    if (txnHash) {
      fetchTransactionDetails(txnHash);
      fetchTransactionMessage(txnHash);
    }
  }, [txnHash]);

  const fetchTransactionDetails = async (txHash: string) => {
    setLoading(true);
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/transaction/getTransactionDetailsByHash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tx_hash: txHash }),
      });

      const data = await response.json();
      if (data.success) {
        setTransactionData(data.transaction);
        setError(null);
      } else {
        await fetchFromAlternativeUrl(txHash);
      }
    } catch (err) {
      await fetchFromAlternativeUrl(txHash);
    } finally {
      setLoading(false);
    }
  };

  const fetchFromAlternativeUrl = async (txHash: string) => {
    setLoading(true);
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/transaction/fetchTransactionData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blockHash: txHash }),
      });

      const data = await response.json();
      if (data.success && data.data && data.data.length > 0) {
        const extrinsic = data.data[0];
        const extractedData = {
          blockNumber: extrinsic.blockNumber,
          transactionHash: extrinsic.blockHash,
          toAddress: extrinsic.signer,
          ipfsHash: extrinsic.events[0]?.data[1],
        };
        setTransactionDataBlockHash(extractedData);
        setError(null);
      } else {
        await fetchFromAlternativeUrl_2(txHash);
      }
    } catch (err) {
      await fetchFromAlternativeUrl_2(txHash);
    } finally {
      setLoading(false);
    }
  };

  const fetchFromAlternativeUrl_2 = async (txHash: string) => {
    setLoading(true);
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/transaction/transactionDetailsEVM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tx_hash: txHash }),
      });

      const data = await response.json();
      if (data.success && data.block.length > 0) {
        setBlockDataEVM(data.block);
        setError(null);
      } else {
        setError('Transaction not found');
      }
    } catch (err) {
      setError('Failed to fetch transaction details');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionMessage = async (txHash: string) => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/transaction/getTransactionMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tx_hash: txHash }),
      });

      const data = await response.json();
      if (data.success) {
        setTransactionMessage(data.message);
      }
    } catch (err) {
      console.error('Error fetching transaction message:', err);
    }
  };

  const convertTo18Precision = (amount: string, decimals = 18) => {
    try {
      const num = parseFloat(amount);
      if (isNaN(num)) return '0';
      return (num / Math.pow(10, decimals)).toFixed(decimals);
    } catch (error) {
      return '0';
    }
  };

  const getTransactionStatus = (events: any) => {
    if (!events) return 'Unknown';
    
    try {
      // If events is a string, parse it as JSON
      const parsedEvents = typeof events === 'string' ? JSON.parse(events) : events;
      
      // Check if parsedEvents is an array
      if (!Array.isArray(parsedEvents)) {
        return 'Unknown';
      }

      const failedEvent = parsedEvents.find((event: any) => event.method === 'ExtrinsicFailed');
      if (failedEvent) {
        return 'Failed';
      }

      const successEvent = parsedEvents.find((event: any) => event.method === 'Transfer');
      if (successEvent) {
        return 'Success';
      }

      return 'Unknown';
    } catch (error) {
      console.error('Error parsing events:', error);
      return 'Unknown';
    }
  };

  const formatTimestamp = (timestamp: any) => {
    try {
      if (!timestamp) return 'N/A';
      
      // Handle Unix timestamp (seconds)
      if (typeof timestamp === 'number' && timestamp < 1e12) {
        timestamp *= 1000;
      }
      
      // Handle string timestamps
      if (typeof timestamp === 'string') {
        // Remove any non-numeric characters except decimal points
        timestamp = timestamp.replace(/[^\d.]/g, '');
        timestamp = parseFloat(timestamp);
        
        // If it's in seconds, convert to milliseconds
        if (timestamp < 1e12) {
          timestamp *= 1000;
        }
      }
      
      const date = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 dark:text-gray-300 text-gray-700 shadow">
        <div className="flex justify-center items-center h-64">
          <div className="loader">
            <Player
              autoplay
              loop
              src={LoadinJson} // Ensure you have this JSON file in your public directory or adjust the path accordingly
              style={{ height: '150px', width: '150px' }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 dark:text-gray-300 text-gray-700 shadow text-center">
        <h1 className="text-4xl font-bold text-red-500">404</h1>
        <p className="mt-2 text-gray-600">The transaction details for the specified address were not found.</p>
        <Link href="/" className="text-[#D91A9C] hover:underline mt-4 inline-block">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <PageLayout title="Transaction Details" loading={loading} error={error}>
      {transactionData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Transaction Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Transaction Hash</label>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-900 dark:text-white break-all">{transactionData.tx_hash}</span>
                    <button
                      className="copy-btn ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      data-clipboard-text={transactionData.tx_hash}
                    >
                      <FiClipboard />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">From</label>
                  <div className="flex items-center mt-1">
                    <Link href={`/address/${transactionData.from_address}`} className="text-blue-600 dark:text-blue-400 hover:underline break-all">
                      {transactionData.from_address}
                    </Link>
                    <button
                      className="copy-btn ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      data-clipboard-text={transactionData.from_address}
                    >
                      <FiClipboard />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">To</label>
                  <div className="flex items-center mt-1">
                    <Link href={`/address/${transactionData.to_address}`} className="text-blue-600 dark:text-blue-400 hover:underline break-all">
                      {transactionData.to_address}
                    </Link>
                    <button
                      className="copy-btn ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      data-clipboard-text={transactionData.to_address}
                    >
                      <FiClipboard />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Amount</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{convertTo18Precision(transactionData.amount)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Gas Fee</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{convertTo18Precision(transactionData.gas_fee)}</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Block Number</label>
                  <Link href={`/block/${transactionData.block_number}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    {transactionData.block_number}
                  </Link>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Timestamp</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatTimestamp(transactionData.timestamp)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Method</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{transactionData.method || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{getTransactionStatus(transactionData.events)}</p>
                </div>
                {transactionMessage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Message</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{transactionMessage}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default TransactionDetails;

"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ClipboardJS from 'clipboard';
import Link from 'next/link';
import { FiClipboard } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import PageLayout from '../../../components/PageLayout';

const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then(mod => mod.Player), {
  ssr: false,
});
import LoadinJson from '../../../../../public/block.json';

interface Block {
  block_number: string;
  block_hash: string;
  parent_hash: string;
  state_root: string;
  extrinsics_root: string;
  timestamp: string;
}

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
  block_number: string;
  timestamp: string;
  from_address: string;
  to_address: string;
  amount: string;
  gas_fee: string;
  method: string;
  events: string;
}

const BlocksDetailsByBlockNumber = () => {
  const [blockData, setBlockData] = useState<Block | null>(null);
  const [transactionData, setTransactionData] = useState<Transaction[] | null>(null);
  const [blockDataEVM, setBlockDataEVM] = useState<BlockEVM[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const blockNumber = pathname?.split('/').pop();

  useEffect(() => {
    const clipboard = new ClipboardJS('.copy-btn');
    clipboard.on('success', function (e) {
      console.log(e);
    });
    clipboard.on('error', function (e) {
      console.log(e);
    });

    return () => {
      clipboard.destroy();
    };
  }, []);

  useEffect(() => {
    if (blockNumber) {
      fetchBlockDetails(blockNumber);
    }
  }, [blockNumber]);

  const fetchBlockDetails = async (blockNumber: string) => {
    setLoading(true);
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/block/blockDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blockNumber }),
      });

      const data = await response.json();
      console.log(data);

      if (data.success) {
        setBlockData(data.block);
        setTransactionData(data.transaction);
        setError(null);
      } else {
        setBlockData(null);
        setTransactionData([]);
        fetchBlockDetailsEVM(blockNumber);
      }
    } catch (err) {
      setBlockData(null);
      setTransactionData([]);
      fetchBlockDetailsEVM(blockNumber);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockDetailsEVM = async (blockNumber: string) => {
    setLoading(true);
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/block/blockDetailsEVM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blockNumber }),
      });

      const data = await response.json();

      if (data.success && data.block.length > 0) {
        setBlockDataEVM(data.block);
        setError(null);
      } else {
        setBlockDataEVM([]);
        setError('Block not found or an error occurred.');
      }
    } catch (err) {
      setBlockDataEVM([]);
      setError('Block not found or an error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string | number | undefined) => {
    if (!timestamp) return 'N/A';
    
    try {
      // Convert to number if it's a string
      const timestampNum = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
      
      // Check if timestamp is in milliseconds or seconds
      const date = new Date(timestampNum * (timestampNum < 10000000000 ? 1000 : 1));
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }

      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(date);
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid Date';
    }
  };

  const getTransactionStatus = (events: string | undefined) => {
    if (!events) return { status: 'Unknown' };
  
    let parsedEvents;
    try {
      parsedEvents = JSON.parse(events);
    } catch (error) {
      console.error("Failed to parse events:", error);
      return { status: 'Unknown' };
    }
  
    const failedEvent = parsedEvents.find((event: any) => event.method === 'ExtrinsicFailed');
    if (failedEvent) {
      return { status: 'Failed', reason: 'FundsUnavailable' };
    }
  
    const successEvent = parsedEvents.find((event: any) => event.method === 'Transfer');
    if (successEvent) {
      return { status: 'Success' };
    }
  
    return { status: 'Unknown' };
  };
  
  return (
    <PageLayout
      title="Block Details"
      loading={loading}
      error={error}
    >
      {blockData && (
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Block Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Block Number</h3>
                <p className="text-gray-800 dark:text-gray-100">{blockData.block_number}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Block Hash</h3>
                <div className="flex items-center space-x-2">
                  <code className="text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded flex-1 overflow-x-auto text-gray-800 dark:text-gray-100">
                    {blockData.block_hash}
                  </code>
                  <button
                    className="copy-btn p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-500 dark:text-gray-400"
                    data-clipboard-text={blockData.block_hash}
                  >
                    <FiClipboard className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Parent Hash</h3>
                <div className="flex items-center space-x-2">
                  <code className="text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded flex-1 overflow-x-auto text-gray-800 dark:text-gray-100">
                    {blockData.parent_hash}
                  </code>
                  <button
                    className="copy-btn p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-500 dark:text-gray-400"
                    data-clipboard-text={blockData.parent_hash}
                  >
                    <FiClipboard className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">State Root</h3>
                <div className="flex items-center space-x-2">
                  <code className="text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded flex-1 overflow-x-auto text-gray-800 dark:text-gray-100">
                    {blockData.state_root}
                  </code>
                  <button
                    className="copy-btn p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-500 dark:text-gray-400"
                    data-clipboard-text={blockData.state_root}
                  >
                    <FiClipboard className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Extrinsics Root</h3>
                <div className="flex items-center space-x-2">
                  <code className="text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded flex-1 overflow-x-auto text-gray-800 dark:text-gray-100">
                    {blockData.extrinsics_root}
                  </code>
                  <button
                    className="copy-btn p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-500 dark:text-gray-400"
                    data-clipboard-text={blockData.extrinsics_root}
                  >
                    <FiClipboard className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Timestamp</h3>
                <p className="text-gray-800 dark:text-gray-100">{formatTimestamp(blockData.timestamp)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EVM Transactions */}
      {blockDataEVM.length > 0 && (
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">EVM Transactions</h2>
            <div className="space-y-6">
              {blockDataEVM.map((transaction, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-6 last:pb-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Transaction Hash</h3>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded flex-1 overflow-x-auto">
                          {transaction.transactionHash}
                        </code>
                        <button
                          className="copy-btn p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          data-clipboard-text={transaction.transactionHash}
                        >
                          <FiClipboard className="h-5 w-5 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">From Address</h3>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/address/${transaction.from}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                        >
                          {transaction.from}
                        </Link>
                        <button
                          className="copy-btn p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          data-clipboard-text={transaction.from}
                        >
                          <FiClipboard className="h-5 w-5 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">To Address</h3>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/address/${transaction.to}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                        >
                          {transaction.to}
                        </Link>
                        <button
                          className="copy-btn p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          data-clipboard-text={transaction.to}
                        >
                          <FiClipboard className="h-5 w-5 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Gas Fee</h3>
                      <p className="text-gray-900 dark:text-white">{transaction.gasFee} AGC</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Amount</h3>
                      <p className="text-gray-900 dark:text-white">{transaction.amount} AGC</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Timestamp</h3>
                      <p className="text-gray-900 dark:text-white">{formatTimestamp(transaction.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Regular Transactions */}
      {transactionData && transactionData.length > 0 && (
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Transactions</h2>
            <div className="space-y-6">
              {transactionData.map((transaction, index) => {
                const statusInfo = getTransactionStatus(transaction.events);
                return (
                  <div key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-6 last:pb-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Transaction Hash</h3>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/tx/${transaction.tx_hash}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                          >
                            {transaction.tx_hash}
                          </Link>
                          <button
                            className="copy-btn p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-500 dark:text-gray-400"
                            data-clipboard-text={transaction.tx_hash}
                          >
                            <FiClipboard className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Status</h3>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          statusInfo.status === 'Success'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : statusInfo.status === 'Failed'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {statusInfo.status}
                          {statusInfo.reason && ` - ${statusInfo.reason}`}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">From Address</h3>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/address/${transaction.from_address}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                          >
                            {transaction.from_address}
                          </Link>
                          <button
                            className="copy-btn p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-500 dark:text-gray-400"
                            data-clipboard-text={transaction.from_address}
                          >
                            <FiClipboard className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">To Address</h3>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/address/${transaction.to_address}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                          >
                            {transaction.to_address}
                          </Link>
                          <button
                            className="copy-btn p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-500 dark:text-gray-400"
                            data-clipboard-text={transaction.to_address}
                          >
                            <FiClipboard className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Method</h3>
                        <p className="text-gray-800 dark:text-gray-100">{transaction.method}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Amount</h3>
                        <p className="text-gray-800 dark:text-gray-100">{transaction.amount} AGC</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Gas Fee</h3>
                        <p className="text-gray-800 dark:text-gray-100">{transaction.gas_fee} AGC</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Timestamp</h3>
                        <p className="text-gray-800 dark:text-gray-100">{formatTimestamp(transaction.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default BlocksDetailsByBlockNumber;
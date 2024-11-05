"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ClipboardJS from 'clipboard';
import Link from 'next/link';
import { FiClipboard } from 'react-icons/fi';
import dynamic from 'next/dynamic';

const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then(mod => mod.Player), {
  ssr: false,
});
import LoadinJson from '../../../../public/block.json';

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
  events: string[];
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
      // console.log(data);

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

  const getTransactionStatus = (events: any[] | undefined) => {
    if (!events) return { status: 'Unknown' };

    const failedEvent = events.find(event => event === 'ExtrinsicFailed');
    if (failedEvent) {
      return { status: 'Failed', reason: 'FundsUnavailable' };
    }

    const successEvent = events.find(event => event === 'Transfer');
    if (successEvent) {
      return { status: 'Success' };
    }

    return { status: 'Unknown' };
  };
  
  if (loading) {
    return (
      <div className="p-4 bg-white text-gray-700 shadow">
        <div className="flex justify-center items-center h-64">
          <Player autoplay loop src={LoadinJson} style={{ height: '150px', width: '150px' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white text-gray-700 shadow text-center">
        <h1 className="text-4xl font-bold text-red-500">404</h1>
        <p className="mt-2 text-gray-600">{error}</p>
        <Link href="/" className="text-[#D91A9C] hover:underline mt-4 inline-block">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {blockData && (
        <div className="mt-6">
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Block Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="flex justify-between">
                <span className="font-semibold">Block Number:</span>
                <span className="flex items-center">{blockData.block_number}</span>
              </div>

              <hr className="opacity-75" />

              <div className="flex justify-between">
                <span className="font-semibold">Block Hash:</span>
                <span className="flex items-center">{blockData.block_hash}</span>
              </div>

              <hr className="opacity-75" />

              <div className="flex justify-between">
                <span className="font-semibold">Parent Hash:</span>
                <span className="flex items-center">{blockData.parent_hash}</span>
              </div>

              <hr className="opacity-75" />

              <div className="flex justify-between">
                <span className="font-semibold">State Root:</span>
                <span className="flex items-center">{blockData.state_root}</span>
              </div>

              <hr className="opacity-75" />

              <div className="flex justify-between">
                <span className="font-semibold">Extrinsics Root:</span>
                <span className="flex items-center">{blockData.extrinsics_root}</span>
              </div>

              <hr className="opacity-75" />

              <div className="flex justify-between">
                <span className="font-semibold">Timestamp:</span>
                <span>{formatTimestamp(blockData.timestamp)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {blockDataEVM.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Transaction Details</h2>
          {blockDataEVM.map((transaction, index) => (
            <div key={index} className="bg-white shadow-md rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="flex justify-between">
                  <span className="font-semibold">Transaction Hash:</span>
                  <span className="flex items-center">{transaction.transactionHash}</span>
                </div>

                <hr className="opacity-75"></hr>

                <div className="flex justify-between">
                  <span className="font-semibold">From Address:</span>
                  <span className="flex items-center">{transaction.from}</span>
                </div>

                <hr className="opacity-75"></hr>

                <div className="flex justify-between">
                  <span className="font-semibold">To Address:</span>
                  <span className="flex items-center">{transaction.to}</span>
                </div>

                <hr className="opacity-75"></hr>

                <div className="flex justify-between">
                  <span className="font-semibold">Gas Fee:</span>
                  <span className="flex items-center">{transaction.gasFee} AGC</span>
                </div>

                <hr className="opacity-75"></hr>

                <div className="flex justify-between">
                  <span className="font-semibold">Amount:</span>
                  <span className="flex items-center">{transaction.amount} AGC</span>
                </div>

                <hr className="opacity-75"></hr>

                <div className="flex justify-between">
                  <span className="font-semibold">Timestamp:</span>
                  <span>{formatTimestamp(transaction.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Transaction List</h2>

        {transactionData && transactionData.length > 0 ? (
          transactionData.map((transaction: Transaction, index: number) => {
            const statusInfo = getTransactionStatus(transaction.events);

            return (
              <div key={index} className="bg-white shadow-md rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div className="flex justify-between">
                    <span className="font-semibold">Transaction Hash:</span>
                    <span className="flex items-center">
                      <Link href={`/tx/${transaction.tx_hash}`} className="hover:underline">
                        {transaction.tx_hash}
                      </Link>
                      <button
                        className="ml-2 copy-btn bg-[#D91A9C] text-white hover:bg-[#e332ab] px-2 py-1 rounded"
                        data-clipboard-text={transaction.tx_hash}
                        title="Copy txhash to clipboard"
                      >
                        <FiClipboard />
                      </button>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <p className="text-gray-600 text-center">No transaction found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlocksDetailsByBlockNumber;

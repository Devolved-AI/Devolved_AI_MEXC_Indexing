"use client";

import React, { useState, useEffect } from 'react';
import ClipboardJS from 'clipboard';
import { FiClipboard } from 'react-icons/fi';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

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

const TransactionDetails = () => {
  const [transactionData, setTransactionData] = useState<any>(null);
  const [blockDataEVM, setBlockDataEVM] = useState<BlockEVM[]>([]);
  const [transactionDataBlockHash, setTransactionDataBlockHash] = useState<any>(null);
  const [transactionMessage, setTransactionMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const txnHash = pathname?.split('/').pop();
  const router = useRouter();

  useEffect(() => {
    const clipboard = new ClipboardJS('.copy-btn');
    clipboard.on('success', e => console.log(e));
    clipboard.on('error', e => console.log(e));
    return () => clipboard.destroy();
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
        setTransactionDataBlockHash(null);
        setError('Transaction not found or an error occurred.');
      }
    } catch (err) {
      setTransactionDataBlockHash(null);
      setError('Transaction not found or an error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionMessage = async (txHash: string) => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/transactionMessage/getTransactionMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tx_hash: txHash }),
      });

      const data = await response.json();
      if (data.success) {
        setTransactionMessage(data.message);
      } else {
        setTransactionMessage('No message');
      }
    } catch (err) {
      console.error('Error fetching transaction message:', err);
      setTransactionMessage('Error fetching message');
    }
  };

  const convertTo18Precision = (amount: string, decimals = 18) => {
    try {
      const balanceBigInt = BigInt(amount);
      const divisor = BigInt(1e18);
      const integerPart = balanceBigInt / divisor;
      const fractionalPart = balanceBigInt % divisor;
      let fractionalStr = fractionalPart.toString().padStart(18, '0').slice(0, decimals);
      fractionalStr = fractionalStr.replace(/0+$/, '');
      return fractionalStr ? `${integerPart}.${fractionalStr}` : integerPart.toString();
    } catch (error) {
      console.error("Invalid input for conversion:", error);
      return '0.0';
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

  if (loading) {
    return (
      <>
        <Header />
        <div className="p-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow">
          <div className="flex justify-center items-center h-64">
            <Player autoplay loop src={LoadinJson} style={{ height: '150px', width: '150px' }} />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="p-4 bg-white dark:bg-gray-800 dark:text-gray-300 text-gray-700 shadow text-center">
          <h1 className="text-4xl font-bold text-red-500">404</h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <Link href="/" className="text-[#D91A9C] hover:underline mt-4 inline-block">
            Return to Home
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Transaction Details</h2>
              
              {transactionData && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-600 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-2">Transaction Hash</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-800 dark:text-white break-all">{transactionData.tx_hash}</span>
                        <button
                          className="copy-btn bg-[#D91A9C] text-white p-2 rounded hover:bg-[#e332ab] transition-colors"
                          data-clipboard-text={transactionData.tx_hash}
                          title="Copy transaction hash"
                        >
                          <FiClipboard />
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-600 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-2">Block Number</h3>
                      <Link href={`/block/${transactionData.block_number}`} className="text-[#D91A9C] hover:underline">
                        {transactionData.block_number}
                      </Link>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-600 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-2">From Address</h3>
                      <div className="flex items-center space-x-2">
                        <Link href={`/address/${transactionData.from_address}`} className="text-[#D91A9C] hover:underline break-all">
                          {transactionData.from_address}
                        </Link>
                        <button
                          className="copy-btn bg-[#D91A9C] text-white p-2 rounded hover:bg-[#e332ab] transition-colors"
                          data-clipboard-text={transactionData.from_address}
                          title="Copy from address"
                        >
                          <FiClipboard />
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-600 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-2">To Address</h3>
                      <div className="flex items-center space-x-2">
                        <Link href={`/address/${transactionData.to_address}`} className="text-[#D91A9C] hover:underline break-all">
                          {transactionData.to_address}
                        </Link>
                        <button
                          className="copy-btn bg-[#D91A9C] text-white p-2 rounded hover:bg-[#e332ab] transition-colors"
                          data-clipboard-text={transactionData.to_address}
                          title="Copy to address"
                        >
                          <FiClipboard />
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-600 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-2">Value</h3>
                      <span className="text-gray-800 dark:text-white">{convertTo18Precision(transactionData.amount)} AGC</span>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-600 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-2">Gas Price</h3>
                      <span className="text-gray-800 dark:text-white">{convertTo18Precision(transactionData.gas_price)} AGC</span>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-600 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-2">Gas Used</h3>
                      <span className="text-gray-800 dark:text-white">{transactionData.gas_used}</span>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-600 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-2">Timestamp</h3>
                      <span className="text-gray-800 dark:text-white">{formatTimestamp(transactionData.timestamp)}</span>
                    </div>
                  </div>
                </div>
              )}

              {blockDataEVM && blockDataEVM.length > 0 && (
                <div className="mt-8 space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">EVM Transaction Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-600 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-2">Transaction Hash</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-800 dark:text-white break-all">{blockDataEVM[0].transactionHash}</span>
                        <button
                          className="copy-btn bg-[#D91A9C] text-white p-2 rounded hover:bg-[#e332ab] transition-colors"
                          data-clipboard-text={blockDataEVM[0].transactionHash}
                          title="Copy transaction hash"
                        >
                          <FiClipboard />
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-600 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-2">Block Number</h3>
                      <Link href={`/block/${blockDataEVM[0].blockNumber}`} className="text-[#D91A9C] hover:underline">
                        {blockDataEVM[0].blockNumber}
                      </Link>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-600 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-2">From Address</h3>
                      <div className="flex items-center space-x-2">
                        <Link href={`/address/${blockDataEVM[0].from}`} className="text-[#D91A9C] hover:underline break-all">
                          {blockDataEVM[0].from}
                        </Link>
                        <button
                          className="copy-btn bg-[#D91A9C] text-white p-2 rounded hover:bg-[#e332ab] transition-colors"
                          data-clipboard-text={blockDataEVM[0].from}
                          title="Copy from address"
                        >
                          <FiClipboard />
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-600 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-2">To Address</h3>
                      <div className="flex items-center space-x-2">
                        <Link href={`/address/${blockDataEVM[0].to}`} className="text-[#D91A9C] hover:underline break-all">
                          {blockDataEVM[0].to}
                        </Link>
                        <button
                          className="copy-btn bg-[#D91A9C] text-white p-2 rounded hover:bg-[#e332ab] transition-colors"
                          data-clipboard-text={blockDataEVM[0].to}
                          title="Copy to address"
                        >
                          <FiClipboard />
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-600 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-2">Value</h3>
                      <span className="text-gray-800 dark:text-white">{convertTo18Precision(blockDataEVM[0].amount)} AGC</span>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-600 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-2">Gas Fee</h3>
                      <span className="text-gray-800 dark:text-white">{convertTo18Precision(blockDataEVM[0].gasFee)} AGC</span>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-600 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-2">Timestamp</h3>
                      <span className="text-gray-800 dark:text-white">{formatTimestamp(blockDataEVM[0].timestamp)}</span>
                    </div>
                  </div>
                </div>
              )}

              {transactionMessage && (
                <div className="mt-8">
                  <div className="bg-gray-50 dark:bg-gray-600 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-2">Transaction Message</h3>
                    <p className="text-gray-800 dark:text-white whitespace-pre-wrap">{transactionMessage}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TransactionDetails;

"use client";

import React, { useState, useEffect } from 'react';
import ClipboardJS from 'clipboard';
import { FiClipboard } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic'; // Import dynamic for client-side rendering
// Dynamically import the Player component for client-side rendering only
const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then(mod => mod.Player), {
  ssr: false,
});
import LoadinJson from '../../../../public/block.json';

const TransactionDetails = () => {
  const [transactionData, setTransactionData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const txnHash = pathname.split('/').pop(); 
  // console.log(txnHash);

  useEffect( () =>
  {
    // Initialize ClipboardJS
    const clipboard = new ClipboardJS( '.copy-btn' );

    clipboard.on( 'success', function ( e )
    {
      console.log( e );
    } );

    clipboard.on( 'error', function ( e )
    {
      console.log( e );
    } );

    // Cleanup
    return () =>
    {
      clipboard.destroy();
    };
  }, [] );

  useEffect(() => {
    if (txnHash) {
      fetchTransactionDetails(txnHash as string);
    }
  }, [txnHash]);

  const fetchTransactionDetails = async (txHash: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/transaction-by-hash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ txHash })
      });

      const data = await response.json();

      if (data.success) {
        setTransactionData(data.result);
        setError(null);
      } else {
        setError(data.message);
        setTransactionData(null);
      }
    } catch (err) {
      setError('Transaction not found or an error occurred.');
      setTransactionData(null);
    } finally {
      setLoading(false);
    }
  };

  const convertTo18Precision = (amount: string) => {
    return (parseFloat(amount) / 1e18).toFixed(18);
  };

  if (loading) {
    return (
      <div className="p-4 bg-white text-gray-700 shadow">
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

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      { transactionData && (
        <div className="mt-6">
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Transaction Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="flex justify-between">
                <span className="font-semibold">Transaction Hash:</span>
                <span className="flex items-center">
                  {transactionData.tx_hash.slice(0, 10) + '...' + transactionData.tx_hash.slice(-5)}
                  <button className="ml-2 copy-btn bg-[#D91A9C] text-white hover:bg-[#e332ab] px-2 py-1 rounded" 
                  data-clipboard-text={transactionData.tx_hash}
                  title="Copy txhash to clipboard">
                    <FiClipboard />
                  </button>
                </span>
              </div>

              <hr className="opacity-75"></hr>

              <div className="flex justify-between">
                <span className="font-semibold">Block Number:</span>
                <span>{ transactionData.block_number }</span>
              </div>

              <hr className="opacity-75"></hr>

              <div className="flex justify-between">
                <span className="font-semibold">From Address:</span>
                <span className="flex items-center">
                  {transactionData.from_address.slice(0, 10) + '...' + transactionData.from_address.slice(-5)}
                  <button className="ml-2 copy-btn bg-[#D91A9C] text-white hover:bg-[#e332ab] px-2 py-1 rounded" 
                  data-clipboard-text={transactionData.from_address}
                  title="Copy from address to clipboard">
                    <FiClipboard />
                  </button>
                </span>
              </div>

              <hr className="opacity-75"></hr>

              <div className="flex justify-between">
                <span className="font-semibold">To Address:</span>
                <span className="flex items-center">
                  {transactionData.to_address.slice(0, 10) + '...' + transactionData.to_address.slice(-5)}
                  <button className="ml-2 copy-btn bg-[#D91A9C] text-white hover:bg-[#e332ab] px-2 py-1 rounded" 
                  data-clipboard-text={transactionData.to_address}
                  title="Copy to address to clipboard">
                    <FiClipboard />
                  </button>
                </span>
              </div>

              <hr className="opacity-75"></hr>

              <div className="flex justify-between">
                <span className="font-semibold">Amount:</span>
                <span>{ convertTo18Precision( transactionData.amount ) } AGC</span>
              </div>

              <hr className="opacity-75"></hr>

              <div className="flex justify-between">
                <span className="font-semibold">Transaction Fee:</span>
                <span>{ convertTo18Precision( transactionData.gas_fee ) } AGC</span>
              </div>

              <hr className="opacity-75"></hr>

              <div className="flex justify-between">
                <span className="font-semibold">Status:</span>
                <span>
                  { transactionData.method === 'balances.transferKeepAlive' || transactionData.method === 'balances.transfer' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Success
                    </span>
                  ) : (
                    <span>{ transactionData.method }</span>
                  ) }
                </span>
              </div>
            </div>
          </div>
        </div>
      ) }
    </div>
  );
};

export default TransactionDetails;

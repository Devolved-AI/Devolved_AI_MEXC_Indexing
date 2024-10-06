"use client";

import React, { useState, useEffect } from 'react';
import ClipboardJS from 'clipboard';
import { FiClipboard } from 'react-icons/fi';
import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic'; // Import dynamic for client-side rendering
import Link from 'next/link';
// Dynamically import the Player component for client-side rendering only
const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then(mod => mod.Player), {
  ssr: false,
});
import LoadinJson from '../../../../public/block.json';

const TransactionDetails = () => {
  const [transactionData, setTransactionData] = useState<any>(null);
  const [transactionMessage, setTransactionMessage] = useState<string | null>(null); // State to store the message
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const pathname = usePathname();
  const txnHash = pathname?.split('/').pop();
  const router = useRouter();

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
      const fetchWithRetry = async (retries: number) => {
        try {
          setLoading(true);
          await fetchTransactionDetails(txnHash as string);
          await fetchTransactionMessage(txnHash as string); //
          setLoading(false);
        } catch (err) {
          if (retries > 0) {
            setRetryCount(prev => prev + 1);
            if (retryCount < 5) {
              window.location.reload(); // Reload the browser window if an error occurs
            } else {
              router.push('/'); // Redirect to the homepage if the error occurs for the 6th time
            }
          } else {
            setError('Transaction not found or an error occurred.');
            setTransactionData(null);
            router.push('/'); // Redirect to the homepage after retries fail
          }
        }
      };

      fetchWithRetry(5); // Attempt to fetch data with 5 retries
    }
  }, [txnHash, retryCount, router]);

  const fetchTransactionDetails = async (txHash: string) => {
    setLoading(true);
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/transaction/getTransactionDetailsByHash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tx_hash: txHash })
      });

      const data = await response.json();

      if (data.success) {
        setTransactionData(data.transaction);
        setError(null);
        setRetryCount(0); // Reset the retry count on success
      } else {
        setError(data.message);
        setTransactionData(null);
        throw new Error(data.message);
      }
    } catch (err) {
      setError('Transaction not found or an error occurred.');
      setTransactionData(null);
      throw err; // Throw the error to trigger retry logic
    } finally {
      setLoading(false);
    }
  };

  // Fetch transaction message by tx_hash
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
        setTransactionMessage(data.message); // Set the fetched message
      } else {
        setTransactionMessage('No message');
      }
    } catch (err) {
      console.error('Error fetching transaction message:', err);
      setTransactionMessage('Error fetching message');
    }
  };

  const convertTo18Precision = (amount: string) => {
    return (parseFloat(amount) / 1e18).toFixed(18);
  };

  // Function to determine the transaction status
  const getTransactionStatus = (events: any[]) => {
    const failedEvent = events.find(event => event.section === 'system' && event.method === 'ExtrinsicFailed');
    if (failedEvent) {
      return { status: 'Failed', reason: 'FundsUnavailable' }; // Display the failure reason
    }
    
    const successEvent = events.find(event => event.section === 'balances' && event.method === 'Transfer');
    if (successEvent) {
      return { status: 'Success' };
    }
    
    return { status: 'Unknown' };
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

  const statusInfo = transactionData ? getTransactionStatus(transactionData.events) : null;

  if (error) {
    return (
      <div className="p-4 bg-white text-gray-700 shadow text-center">
        <h1 className="text-4xl font-bold text-red-500">404</h1>
        <p className="mt-2 text-gray-600">The transaction details for the specified address were not found.</p>
        <Link href="/" className="text-[#D91A9C] hover:underline mt-4 inline-block">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
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
                  {statusInfo && statusInfo.status === 'Failed' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      Failed - {statusInfo.reason}
                    </span>
                  ) : statusInfo && statusInfo.status === 'Success' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Success
                    </span>
                  ) : (
                    <span>Unknown</span>
                  )}
                </span>
              </div>

              <hr className="opacity-75"></hr>

              <div className="flex justify-between">
                <span className="font-semibold">Message:</span>
                <span>{transactionMessage ? transactionMessage : 'No message'}</span>
              </div>

            </div>
          </div>
        </div>
      ) }
    </div>
  );
};

export default TransactionDetails;

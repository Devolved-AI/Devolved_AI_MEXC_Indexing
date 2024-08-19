"use client"

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ClipboardJS from 'clipboard';
import dynamic from 'next/dynamic'; // Import dynamic for client-side rendering
// Dynamically import the Player component for client-side rendering only
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

const BlocksDetailsByBlockNumber = () => {
  const [blockData, setBlockData] = useState<Block | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const pathname = usePathname();
  const blockNumber = pathname.split('/').pop();
  const router = useRouter();

  useEffect(() => {
    // Initialize ClipboardJS
    const clipboard = new ClipboardJS('.copy-btn');
    
    clipboard.on('success', function(e) {
      console.log(e);
    });
    
    clipboard.on('error', function(e) {
      console.log(e);
    });

    // Cleanup
    return () => {
      clipboard.destroy();
    };
  }, []);

  useEffect(() => {
    if (blockNumber) {
      const fetchWithRetry = async (retries: number) => {
        try {
          setLoading(true);
          await fetchBlockDetails(blockNumber as string);
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
            setBlockData(null);
            router.push('/'); // Redirect to the homepage after retries fail
          }
        }
      };

      fetchWithRetry(5); // Attempt to fetch data with 5 retries
    }
  }, [blockNumber, retryCount, router]);

  const fetchBlockDetails = async (blockNumber: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/block-details-by-block-number', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ blockNumber })
      });

      const data = await response.json();
      // console.log(data);

      if (data.success) {
        setBlockData(data.result);
        setError(null);
        setRetryCount(0); // Reset the retry count on success
      } else {
        setError(data.message);
        setBlockData(null);
        throw new Error(data.message);
      }
    } catch (err) {
      setError('Transaction not found or an error occurred.');
      setBlockData(null);
      throw err; // Throw the error to trigger retry logic
    } finally {
      setLoading(false);
    }
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

      {blockData && (
        <div className="mt-6">
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Block Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="flex justify-between">
                <span className="font-semibold">Block Number:</span>
                <span className="flex items-center">{blockData.block_number}</span>
              </div>

              <hr className="opacity-75"></hr>

              <div className="flex justify-between">
                <span className="font-semibold">Block Hash:</span>
                <span className="flex items-center">{blockData.block_hash.slice(0, 10) + '...' + blockData.block_hash.slice(-6)}</span>
              </div>

              <hr className="opacity-75"></hr>

              <div className="flex justify-between">
                <span className="font-semibold">Parent Hash:</span>
                <span className="flex items-center">{blockData.parent_hash.slice(0, 10) + '...' + blockData.parent_hash.slice(-6)}</span>
              </div>

              <hr className="opacity-75"></hr>

              <div className="flex justify-between">
                <span className="font-semibold">State Root:</span>
                <span className="flex items-center">{blockData.state_root.slice(0, 10) + '...' + blockData.state_root.slice(-6)}</span>
              </div>

              <hr className="opacity-75"></hr>

              <div className="flex justify-between">
                <span className="font-semibold">Extrinsics Root:</span>
                <span className="flex items-center">{blockData.extrinsics_root.slice(0, 10) + '...' + blockData.extrinsics_root.slice(-6)}</span>
              </div>

              <hr className="opacity-75"></hr>

              <div className="flex justify-between">
                <span className="font-semibold">Timestamp:</span>
                <span>{blockData.timestamp}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default BlocksDetailsByBlockNumber;

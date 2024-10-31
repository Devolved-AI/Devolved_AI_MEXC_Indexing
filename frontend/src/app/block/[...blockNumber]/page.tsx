"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ClipboardJS from 'clipboard';
import Link from 'next/link';
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
  const pathname = usePathname();
  const blockNumber = pathname?.split('/').pop();

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
      fetchBlockDetails(blockNumber);
    }
  }, [blockNumber]);

  const fetchBlockDetails = async (blockNumber: string) => {
    setLoading(true); // Start loading
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/block/blockDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ blockNumber })
      });

      const data = await response.json();

      if (data.success) {
        setBlockData(data.block);
        setError(null); // Clear any errors
      } else {
        setBlockData(null);
        setError('Block not found or an error occurred.');
      }
    } catch (err) {
      setBlockData(null);
      setError('Block not found or an error occurred.');
    } finally {
      setLoading(false); // Stop loading when fetch is complete
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

  // Show loading screen while data is being fetched
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

  // Show error if any occurs
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

  // Show block details once data is fetched and no error occurs
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
                <span>{formatTimestamp(blockData.timestamp)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlocksDetailsByBlockNumber;

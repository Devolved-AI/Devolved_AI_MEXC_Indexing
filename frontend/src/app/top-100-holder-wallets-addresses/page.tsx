"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import dynamic from 'next/dynamic';

const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then(mod => mod.Player), {
  ssr: false,
});
import LoadinJson from '../../../public/block.json';

// Define the shape of an account item.
interface Account {
  serial: number;
  address: string;
  balance: string;
}

// Define the shape of the API response.
interface ApiResponse {
  status: number;
  success: boolean;
  message: string;
  data: Account[];
}



const Top100HolderWalletsAddresses: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/accounts/top-accounts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result: ApiResponse = await response.json();

        console.log("top 100", result);
        if (result.success) {
          setAccounts(result.data);
        } else {
          throw new Error(result.message || "Error fetching data from API");
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-white text-gray-700 shadow">
        <div className="flex justify-center items-center h-64">
          <Player autoplay loop src={LoadinJson} style={{ height: '150px', width: '150px' }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>Top 100 Accounts</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Top 100 Accounts</h1>

        {loading && <p className="text-center text-lg">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serial
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AGC Balance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.map((account) => (
                  <tr key={account.serial}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {account.serial}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 break-words">
                      {account.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {account.balance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Top100HolderWalletsAddresses;

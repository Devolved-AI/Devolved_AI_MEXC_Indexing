import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/redisClient';
import { formatDistanceToNow } from 'date-fns';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  if (request.method !== "POST") {
    return NextResponse.json(
      {
        success: false,
        message: "Method not allowed!",
      },
      { status: 405 }
    );
  }

  try {
    const redisClient = getClient();
    
    // Using the native Promise-based lRange method
    const data_size = 5;
    const transactions = await redisClient.lRange('latest_transactions', 0, data_size - 1);

    if (!transactions || transactions.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No transactions found' },
        { status: 404 }
      );
    }

    const results = transactions.map((transaction: string) => {
      try {
        const parsedTransaction = JSON.parse(transaction);
        return {
          tx_hash: parsedTransaction.tx_hash,
          age: parsedTransaction.timestamp ? formatDistanceToNow(new Date(parsedTransaction.timestamp)) + ' ago' : 'N/A',
          from_address: parsedTransaction.from_address,
          to_address: parsedTransaction.to_address
        };
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return null;
      }
    }).filter((result: any) => result !== null);

    return NextResponse.json(
      { success: true, result: results },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error fetching transactions:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
};

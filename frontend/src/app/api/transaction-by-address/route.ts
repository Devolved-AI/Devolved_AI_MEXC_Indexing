import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, pool } from '@/lib/dbConnect';
import { formatDistanceToNow } from 'date-fns';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  if (request.method !== "POST") {
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Method not allowed!",
      }),
      {
        status: 405,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }

  const nextActionHeader = request.headers.get("next-action");
  if (!nextActionHeader) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Missing 'next-action' header",
      }),
      {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }

  const { address } = await request.json();

  if (!address) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Address is required",
      }),
      {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }

  try {
    await connectToDatabase();
    
    const query = `
      SELECT transactions.tx_hash, transactions.method, transactions.block_number, blocks.timestamp, transactions.from_address, transactions.to_address, transactions.amount, transactions.gas_fee as gas_fee
      FROM transactions
      LEFT JOIN blocks ON transactions.block_number = blocks.block_number
      WHERE transactions.from_address = $1 OR transactions.to_address = $1
      ORDER BY transactions.block_number DESC
    `;
    const values = [address];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "No transactions found for the given address",
        }),
        {
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    const transactions = result.rows.map(tx => ({
      tx_hash: tx.tx_hash,
      method: tx.method,
      block_number: tx.block_number,
      age: tx.timestamp ? `${formatDistanceToNow(new Date(tx.timestamp))} ago` : 'N/A',
      from_address: tx.from_address,
      to_address: tx.to_address,
      amount: tx.amount,
      gas_fee: tx.gas_fee,
    }));

    return new NextResponse(
      JSON.stringify({
        success: true,
        result: transactions,
      }),
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
};

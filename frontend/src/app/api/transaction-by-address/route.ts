import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, pool } from '@/lib/dbConnect';
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
  
  const { address } = await request.json();

  if (!address) {
    return NextResponse.json(
      {
        success: false,
        message: "Address is required",
      },
      { status: 400 }
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
        return NextResponse.json(
            {
              success: false,
              message: "No transactions found for the given address",
            },
            { status: 404 }
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

    return NextResponse.json(
        {
            success: true,
            result: transactions,
        },
        { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
        {
            success: false,
            message: 'Internal server error',
        },
        { status: 500 }
    );
  }
};
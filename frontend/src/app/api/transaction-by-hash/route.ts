import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, pool } from '@/lib/dbConnect';
import { getClient } from '@/lib/redisClient';

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
  
  const { txHash } = await request.json();

  if (!txHash) {
    return NextResponse.json(
      {
        success: false,
        message: "Transaction hash is required",
      },
      { status: 400 }
    );
  }

  try {
    const redisClient = getClient();

    // Try to fetch transaction from Redis
    const redisData = await redisClient.get(txHash);

    if (redisData) {
      const transaction = JSON.parse(redisData);
      return NextResponse.json(
        {
          success: true,
          result: transaction,
        },
        { status: 200 }
      );
    }

    // If not found in Redis, fetch from PostgreSQL
    await connectToDatabase();

    const query = `
      SELECT * FROM transactions
      WHERE tx_hash = $1
    `;
    const values = [txHash];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction not found",
        },
        { status: 404 }
      );
    }

    const transaction = result.rows[0];

    // Save the transaction to Redis for future queries
    await redisClient.set(txHash, JSON.stringify(transaction));

    return NextResponse.json(
      {
        success: true,
        result: transaction,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error: ", error);
    return NextResponse.json(
      {
        success: false,
        result: "Internal server error",
      },
      { status: 500 }
    );
  }
};

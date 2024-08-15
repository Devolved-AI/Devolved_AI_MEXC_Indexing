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

  const { blockNumber } = await request.json()

  if (!blockNumber) {
    return NextResponse.json(
      {
        success: false,
        message: "Block number is required",
      },
      { status: 400 }
    );
  }

  try {
    const redisClient = getClient();

    // Try to fetch transaction from Redis
    const redisData = await redisClient.get(`block_${blockNumber}`);

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
      SELECT * FROM blocks
      WHERE block_number = $1
    `;
    const values = [blockNumber];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Block not found",
        },
        { status: 404 }
      );
    }

    const block = result.rows[0];

    // Save the transaction to Redis for future queries
    await redisClient.set(`block_${blockNumber}`, JSON.stringify(block));

    return NextResponse.json(
      {
        success: true,
        result: block,
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

import { NextRequest, NextResponse } from "next/server";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { pool } from '@/lib/dbConnect';

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
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { message: "Address is required" },
        { status: 400 }
      );
    }

    const provider = new WsProvider(process.env.RPC_NODE_URL);
    const api = await ApiPromise.create({ provider });

    // @ts-ignore
    const { data: balance } = await api.query.system.account(address);
    const balanceValue = parseFloat(balance.free.toString()) / Math.pow(10, 18);

    // Format balance to 4 decimal places and add commas
    const balanceFormatted = balanceValue.toLocaleString(undefined, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    });

    // Update balance in PostgreSQL
    await pool.query(
      `INSERT INTO account_balances (account_address, balance, last_updated)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (account_address)
       DO UPDATE SET balance = $2, last_updated = CURRENT_TIMESTAMP`,
      [address, balanceFormatted]
    );

    // Fetch the updated balance from PostgreSQL
    const result = await pool.query(
      'SELECT balance FROM account_balances WHERE account_address = $1',
      [address]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "No balance found for the given address" },
        { status: 404 }
      );
    }

    const updatedBalance = result.rows[0].balance + " AGC";

    return NextResponse.json({
      success: true,
      balance: updatedBalance
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching balance:", error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`;
    }
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
};
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
    let data_size = 5;
    const blocks = await redisClient.lRange('latest_blocks', 0, data_size - 1);

    if (!blocks || blocks.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No blocks found' },
        { status: 404 }
      );
    }

    const results = blocks.map((block: string) => {
      try {
        const parsedBlock = JSON.parse(block);
        return {
          block_number: parsedBlock.block_number,
          age: formatDistanceToNow(new Date(parsedBlock.timestamp), { addSuffix: true }),
          validated_by: parsedBlock.validated_by || 'N/A'
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
    console.error('Error fetching blocks:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
};

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';

// The second argument is inline-typed:
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return NextResponse.json(
      { message: 'Invalid anime ID format' },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db('animeDB');

    const review = await db.collection('anime_reviews').findOne(
      { anime_id: numericId },
      {
        projection: {
          anime_id: 1,
          title: 1,
          reviews: 1,
        },
      }
    );

    if (!review) {
      return NextResponse.json(
        { message: `Reviews not found for anime_id: ${numericId}` },
        { status: 404 }
      );
    }

    return NextResponse.json(review);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Failed to fetch reviews', error: errorMessage },
      { status: 500 }
    );
  }
}

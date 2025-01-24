import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Destructure id from params
    const { id } = params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      console.error('Invalid anime ID format:', id);
      return NextResponse.json(
        { message: 'Invalid anime ID format' },
        { status: 400 }
      );
    }

    console.log('Fetching reviews for anime_id:', numericId);

    const client = await clientPromise;
    const db = client.db('animeDB');

    const review = await db.collection('anime_reviews').findOne(
      { anime_id: numericId },
      {
        projection: {
          anime_id: 1,
          title: 1,
          reviews: 1, // Just fetch reviews as strings
        },
      }
    );

    if (!review) {
      console.error('No reviews found for anime_id:', numericId);
      return NextResponse.json(
        { message: `Reviews not found for anime_id: ${numericId}` },
        { status: 404 }
      );
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error('Failed to fetch reviews for anime_id:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Failed to fetch reviews', error: errorMessage },
      { status: 500 }
    );
  }
}

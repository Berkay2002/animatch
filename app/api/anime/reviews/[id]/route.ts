import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';

export async function GET(request: NextRequest) {
  // The URL might be something like ".../api/anime/reviews/123"
  const url = new URL(request.url);
  // Get segments from the path
  // e.g. /api/anime/reviews/123 -> ["", "api", "anime", "reviews", "123"]
  const segments = url.pathname.split('/').filter(Boolean);

  // The last segment should be your ID, or you can find it by index
  const id = segments[segments.length - 1];
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
      { projection: { anime_id: 1, title: 1, reviews: 1 } }
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

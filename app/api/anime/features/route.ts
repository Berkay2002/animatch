import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '../../../../lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('animeDB');

    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'Popularity';
    // We remove the limit entirely for a "heavy" fetch
    // const limitParam = searchParams.get('limit') || '30';
    // const limit = parseInt(limitParam, 10);

    // Example sorts
    const sortOptions: Record<string, 1 | -1> = {
      Popularity: 1,  // ascending
      Score: -1,      // descending
      Rank: 1,        // ascending
    };
    const sortOrder: 1 | -1 = sortOptions[sortBy] ?? -1;

    // 1) Fetch all from 'anime_features' (no limit)
    const featuresCollection = db.collection('anime_features');
    const features = await featuresCollection
      .find({})
      .project({
        English: 1,
        Japanese: 1,
        Synonyms: 1,
        Genres: 1,
        Studios: 1,
        Description: 1,
        image_url: 1,
        Popularity: 1,
        Rank: 1,
        Score: 1,
        anime_id: 1,
        // include any other fields you need
      })
      .sort({ [sortBy]: sortOrder })
      .toArray();

    // 2) Extract anime_ids
    const animeIds = features.map((f) => f.anime_id).filter(Boolean);

    // 3) Fetch all matching docs from 'anime_embeddings' (no limit)
    const embeddingsCollection = db.collection('anime_embeddings');
    const embeddingDocs = await embeddingsCollection
      .find({ anime_id: { $in: animeIds } })
      .toArray();

    // 4) Merge results
    const merged = features.map((feat) => {
      const embed = embeddingDocs.find((e) => e.anime_id === feat.anime_id) || {};

      // Destructure top-level bert fields
      const {
        bert_description = [],
        bert_genres = [],
        bert_demographic = [],
        bert_rating = [],
        bert_themes = [],
      } = embed;

      // Fallback title from whichever naming fields exist
      const fallbackTitle =
        feat.English ||
        feat.Synonyms ||
        feat.Japanese ||
        embed.English ||
        embed.Synonyms ||
        embed.Japanese ||
        'Unknown Title';

      return {
        ...feat,
        // Overwrite or define final bert arrays
        bert_description,
        bert_genres,
        bert_demographic,
        bert_rating,
        bert_themes,
        // Unified "title" field
        title: fallbackTitle,
      };
    });

    return NextResponse.json(merged);
  } catch (err) {
    console.error('Failed to fetch or merge anime data:', err);
    return NextResponse.json(
      { message: 'Failed to fetch or merge anime data' },
      { status: 500 },
    );
  }
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import RecommendationList from '../../../components/RecommendationList';
import { Anime, Recommendation } from '../../../lib/types';
//import { AnimeCardProps } from '../../../components/AnimeCards';

export default function AnimeDetailPage() {
  const { id } = useParams();
  const numericId = Number(id);

  const [anime, setAnime] = useState<Anime | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [reviews, setReviews] = useState<string[]>([]);
  const [generalFeatures, setGeneralFeatures] = useState<Anime[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [recommendedAnime, setRecommendedAnime] = useState<Anime[]>([]);

  const fetchGeneralFeatures = useCallback(async () => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    try {
      console.log(`Fetching general features from ${apiBase}/api/anime/features?limit=657`);
      const response = await fetch(`${apiBase}/api/anime/features?limit=657`);
      if (!response.ok) {
        throw new Error(`Failed to fetch general features: ${response.statusText}`);
      }

      const featuresData: Anime[] = await response.json();
      console.log('Fetched general features:', featuresData);
      setGeneralFeatures(featuresData);

      const selectedAnime = featuresData.find((anime) => anime.anime_id === numericId);
      if (selectedAnime) {
        setAnime(selectedAnime);
        console.log('Selected anime:', selectedAnime);
      } else {
        console.error(`Anime with ID ${numericId} not found in general features`);
      }
    } catch (error) {
      console.error("Error fetching general features:", error);
    } finally {
      setLoading(false);
    }
  }, [numericId]);

  const fetchReviews = useCallback(async () => {
    try {
      console.log(`Fetching reviews for anime ID ${id}`);
      const response = await fetch(`/api/anime/reviews/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Fetched reviews:', data.reviews);
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  }, [id]);

  const calculateRecommendations = useCallback(() => {
    if (anime && generalFeatures.length > 0) {
      console.log('Calculating recommendations for anime:', anime);
      const worker = new Worker("/worker.js");
      const selectedTitle = anime.English || anime.Japanese || anime.Synonyms || 'Unknown Title';
      worker.postMessage({
        selectedEmbedding: anime,
        allEmbeddings: generalFeatures,
        selectedTitle,
        selectedAnimeIds: [numericId],
        weights: {
          bert_description: 0.25,
          bert_genres: 0.25,
          bert_demographic: 0.15,
          bert_rating: 0.10,
          bert_themes: 0.25,
        },
      });

      worker.onmessage = (e) => {
        const recommendations = e.data;
        if (Array.isArray(recommendations) && recommendations.length > 0) {
          setRecommendations(recommendations);
          console.log('Received recommendations:', recommendations);
        } else {
          console.warn("No valid recommendations received.");
        }
        worker.terminate();
      };
    }
  }, [anime, generalFeatures, numericId]);

  useEffect(() => {
    fetchGeneralFeatures();
    fetchReviews();
  }, [fetchGeneralFeatures, fetchReviews]);

  useEffect(() => {
    calculateRecommendations();
  }, [calculateRecommendations]);

  useEffect(() => {
    if (recommendations.length > 0 && generalFeatures.length > 0) {
      const animeList = recommendations
        .map((rec) => generalFeatures.find((anime) => anime.anime_id === rec.anime_id))
        .filter(Boolean) as Anime[];
      setRecommendedAnime(animeList);
      console.log('Recommended anime list:', animeList);
    }
  }, [recommendations, generalFeatures]);

  if (loading) {
    return <p className="container mx-auto p-4">Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      {anime ? (
        <>
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3">
              <Image
                src={anime.image_url || "/placeholder.jpg"}
                alt={anime.English || "Anime Image"}
                width={200}
                height={300}
                className="object-cover w-full h-full rounded-lg"
              />
            </div>
            <div className="md:w-2/3 md:pl-6">
              <h1 className="text-2xl font-bold text-blue-600">{anime.English || "Unknown Title"}</h1>
              <p className="text-gray-700 mt-2">
                {anime.Description || "No description available."}
              </p>
              <div className="mt-4 space-y-2">
                <p><strong>Score:</strong> {anime.Score ?? "N/A"}</p>
                <p><strong>Rank:</strong> {anime.Rank ?? "N/A"}</p>
                <p><strong>Popularity:</strong> {anime.Popularity ?? "N/A"}</p>
                <p><strong>Genres:</strong> {Array.isArray(anime.Genres) ? anime.Genres.join(", ") : "N/A"}</p>
                <p><strong>Demographic:</strong> {anime.Demographic || "N/A"}</p>
                <p><strong>Rating:</strong> {anime.Rating || "N/A"}</p>
              </div>
            </div>
          </div>
          <h2 className="mt-8 text-xl font-semibold">Recommendations:</h2>
          {recommendedAnime.length > 0 ? (
            <RecommendationList
              recommendedAnime={recommendedAnime}
              showIcon={false}
            />
          ) : (
            <p className="text-gray-500">No recommendations available.</p>
          )}
          <h2 className="mt-8 text-xl font-semibold">Reviews:</h2>
          <div className="mt-4 space-y-4">
            {reviews && reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div key={index} className="bg-gray-100 p-4 rounded shadow">
                  <p className="text-gray-800">{review}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No reviews available.</p>
            )}
          </div>
        </>
      ) : (
        <p className="text-gray-500">Anime not found.</p>
      )}
    </div>
  );
}
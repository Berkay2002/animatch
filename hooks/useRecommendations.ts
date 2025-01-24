import { useState, useEffect } from 'react';
import { Anime } from '../lib/types';

interface UseRecommendationsProps {
  selectedAnimeIds: number[];
}

export function useRecommendations({ selectedAnimeIds }: UseRecommendationsProps) {
  const [recommendedAnime, setRecommendedAnime] = useState<Anime[]>([]);
  const [allAnime, setAllAnime] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllAnime() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/anime/features');
        if (!response.ok) {
          throw new Error(`Failed to fetch anime features: ${response.statusText}`);
        }
        const data: Anime[] = await response.json();
        setAllAnime(data);
        console.log('Fetched all anime:', data);
      } catch (err) {
        console.error('Failed to fetch anime features:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllAnime();
  }, []);

  useEffect(() => {
    if (selectedAnimeIds.length > 0 && allAnime.length > 0) {
      const selectedAnime = allAnime.find(anime => selectedAnimeIds.includes(anime.anime_id));
      if (!selectedAnime) return;

      const selectedEmbedding = {
        bert_description: selectedAnime.bert_description,
        bert_genres: selectedAnime.bert_genres,
        bert_demographic: selectedAnime.bert_demographic,
        bert_rating: selectedAnime.bert_rating,
        bert_themes: selectedAnime.bert_themes,
      };

      console.log('Selected anime for recommendations:', selectedAnime);
      console.log('Selected anime title:', selectedAnime.English || selectedAnime.Japanese);
      const worker = new Worker('/worker.js');
      worker.postMessage({
        selectedEmbedding,
        allEmbeddings: allAnime,
        selectedTitle: selectedAnime.English || selectedAnime.Japanese,
        selectedAnimeIds,
      });

      worker.onmessage = function (e) {
        const similarities = e.data;
        console.log('Received recommendations from worker:', similarities);
        interface Similarity {
          anime_id: number;
          score: number;
        }

        const recommendations: Anime[] = (similarities as Similarity[])
          .slice(0, 30)
          .map(sim => allAnime.find(anime => anime.anime_id === sim.anime_id))
          .filter(Boolean) as Anime[];
        setRecommendedAnime(recommendations);
        worker.terminate();
      };
    }
  }, [selectedAnimeIds, allAnime]);

  return { recommendedAnime, isLoading, error };
}
// frontend/components/RecommendedSection.tsx

import SectionHeader from './SectionHeader';
import RecommendationList from './RecommendationList';
import { useRecommendations } from '../hooks/useRecommendations';
import { Anime } from '../lib/types';

interface RecommendedSectionProps {
  onSelectAnime: (anime: Anime) => void;
  selectedAnimeIds: number[];
}

export default function RecommendedSection({ onSelectAnime, selectedAnimeIds }: RecommendedSectionProps) {
  const { recommendedAnime, isLoading, error } = useRecommendations({ selectedAnimeIds });

  console.log('RecommendedSection received recommendations:', recommendedAnime);

  if (!recommendedAnime.length && !isLoading) {
    return null; // Hide the section if there are no recommendations
  }


  return (
    <section className="relative fade-in">
      <SectionHeader title="Recommended" />
      {isLoading ? (
        <p className="text-gray-500">Loading recommendations...</p>
      ) : error ? (
        <p className="text-red-500">Error loading recommendations: {error}</p>
      ) : (
        <RecommendationList recommendedAnime={recommendedAnime} onSelectAnime={onSelectAnime} />
      )}
    </section>
  );
}
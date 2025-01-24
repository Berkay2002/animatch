"use client";

import YourChoiceSection from '../components/YourChoiceSection';
import RecommendedSection from '../components/RecommendedSection';
import TrendingSection from '../components/TrendingSection';
import TopRankedSection from '../components/TopRankedSection';
import { useState } from 'react';
import { Anime } from '../lib/types';

const HomePage: React.FC = () => {
  const [selectedAnime, setSelectedAnime] = useState<Anime[]>([]);
  const [selectedAnimeIds, setSelectedAnimeIds] = useState<number[]>([]);

  const handleSelectAnime = (anime: Anime) => {
    if (!selectedAnimeIds.includes(anime.anime_id)) {
      const updatedSelectedAnime = [...selectedAnime, anime];
      setSelectedAnime(updatedSelectedAnime);
      setSelectedAnimeIds([...selectedAnimeIds, anime.anime_id]);
    }
  };

  const handleRemoveAnime = (anime: Anime) => {
    const updatedSelectedAnime = selectedAnime.filter((a) => a.anime_id !== anime.anime_id);
    setSelectedAnime(updatedSelectedAnime);
    setSelectedAnimeIds(updatedSelectedAnime.map((a) => a.anime_id));
  };

  return (
    <div>
      <div className="space-y-8">
        <YourChoiceSection 
          selectedAnime={selectedAnime} 
          onRemoveAnime={handleRemoveAnime} 
        />
        <RecommendedSection
          selectedAnimeIds={selectedAnimeIds}
          onSelectAnime={handleSelectAnime}
        />
        <TrendingSection 
          onSelectAnime={handleSelectAnime} 
          selectedAnimeIds={selectedAnimeIds} 
        />
        <TopRankedSection 
          onSelectAnime={handleSelectAnime} 
          selectedAnimeIds={selectedAnimeIds} 
        />
      </div>
    </div>
  );
};

export default HomePage;
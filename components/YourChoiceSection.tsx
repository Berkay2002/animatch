// YourChoiceSection.tsx
"use client";

import { useEffect } from 'react';
import SectionHeader from './SectionHeader';
import AnimatedAnimeCard from './AnimatedAnimeCard';

interface Anime {
  anime_id: number;
  English?: string;
  Japanese?: string;
  image_url?: string;
}

interface YourChoiceSectionProps {
  selectedAnime: Anime[];
  onRemoveAnime: (anime: Anime) => void;
}

export default function YourChoiceSection({ selectedAnime, onRemoveAnime }: YourChoiceSectionProps) {
  useEffect(() => {
    console.log(selectedAnime);
  }, [selectedAnime]);

  if (selectedAnime.length === 0) return null;

  return (
    <section className="relative">
      <SectionHeader title="My List" />
      <div className="flex space-x-4 overflow-hidden pl-6 h-350">
        {selectedAnime.map((anime) => (
          <AnimatedAnimeCard
            key={anime.anime_id}
            anime={anime}
            cardRef={{ current: null }}
            iconType="minus"
            onRemove={onRemoveAnime}
          />
        ))}
      </div>
    </section>
  );}
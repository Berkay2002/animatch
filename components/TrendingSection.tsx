"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import AnimatedAnimeCard from './AnimeCard';
import ScrollButton from './ScrollButton';
import SectionHeader from './SectionHeader';
import { useFetchData } from '../hooks/useFetchData';
import { useScroll } from '../hooks/useScroll';
import { Anime } from '../lib/types';

interface TrendingSectionProps {
  onSelectAnime: (anime: Anime) => void;
  selectedAnimeIds: number[];
}

interface LastAnimeElementRefProps {
  node: HTMLElement | null;
}

export default function TrendingSection({ onSelectAnime, selectedAnimeIds }: TrendingSectionProps) {
  const [trendingAnime] = useFetchData<Anime[]>('/api/anime/features?sortBy=Popularity');
  const [visibleAnime, setVisibleAnime] = useState<Anime[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const { containerRef, cardRef, showLeftArrow, showRightArrow, scrollLeft, scrollRight } = useScroll();
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (trendingAnime && trendingAnime.length > 0) {
      setVisibleAnime(trendingAnime.slice(0, 20)); // Initially render the first 20 items
    }
  }, [trendingAnime]);

  const loadMoreAnime = useCallback(() => {
    if (!trendingAnime || visibleAnime.length >= trendingAnime.length) {
      setHasMore(false);
      return;
    }
    const nextVisibleAnime = trendingAnime ? trendingAnime.slice(visibleAnime.length, visibleAnime.length + 20) : [];
    setVisibleAnime((prev: Anime[]) => [...prev, ...nextVisibleAnime]);
  }, [trendingAnime, visibleAnime]);

  const lastAnimeElementRef = useCallback((node: LastAnimeElementRefProps['node']) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreAnime();
      }
    });
    if (node) observer.current.observe(node);
  }, [hasMore, loadMoreAnime]);

  const filteredAnime: Anime[] = visibleAnime.filter((anime: Anime) => !selectedAnimeIds.includes(anime.anime_id));

  if (!visibleAnime.length) return <div>Loading...</div>;

  return (
    <section className="relative">
      <SectionHeader title="Trending" />
      <div className="relative flex items-center overflow-visible">
        <div
          className="flex space-x-4 overflow-hidden scrollbar-hide pl-6 h-350"
          ref={containerRef}
          style={{
            display: 'flex',
            gap: '0.3rem',
            overflowX: 'auto',
            scrollBehavior: 'smooth',
          }}
        >
          {filteredAnime.map((anime, index) => {
            if (filteredAnime.length === index + 1) {
              return (
                <div ref={lastAnimeElementRef} key={anime.anime_id}>
                  <AnimatedAnimeCard
                    anime={anime}
                    cardRef={cardRef}
                    iconType="plus"
                    onSelect={onSelectAnime}
                  />
                </div>
              );
            } else {
              return (
                <AnimatedAnimeCard
                  key={anime.anime_id}
                  anime={anime}
                  cardRef={cardRef}
                  iconType="plus"
                  onSelect={onSelectAnime}
                />
              );
            }
          })}
        </div>

        <ScrollButton direction="left" onClick={scrollLeft} show={showLeftArrow} />
        <ScrollButton direction="right" onClick={scrollRight} show={showRightArrow} />
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .fade-in {
          animation: fadeIn 0.5s;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </section>
  );
}

// frontend/components/AnimatedAnimeCard.tsx

import { motion } from 'framer-motion';
import AnimeCard from './AnimeCard';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { Anime } from '../lib/types';

interface AnimatedAnimeCardProps {
  anime: Anime;
  cardRef: React.RefObject<HTMLDivElement | null>;
  iconType?: 'plus' | 'minus'; // Make this optional
  onSelect?: (anime: Anime) => void;
  onRemove?: (anime: Anime) => void;
  showIcon?: boolean;
}

const AnimatedAnimeCard: React.FC<AnimatedAnimeCardProps> = ({ anime, cardRef, iconType, onSelect, onRemove, showIcon = true }) => {
  function handleClick() {
    if (iconType === 'plus' && onSelect) {
      onSelect(anime);
    } else if (iconType === 'minus' && onRemove) {
      onRemove(anime);
    }
  }

  return (
    <motion.div
      key={anime.anime_id}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {showIcon && iconType && (
        <div
          className="absolute top-2 right-2 bg-white p-1 rounded-full cursor-pointer z-10"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          {iconType === 'plus' ? <FaPlus color="black" /> : <FaMinus color="black" />}
        </div>
      )}
      <AnimeCard
        anime={anime}
        cardRef={cardRef}
        iconType={iconType}
        onSelect={onSelect}
        onRemove={onRemove}
      />
    </motion.div>
  );
};

export default AnimatedAnimeCard;
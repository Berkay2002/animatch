import Link from 'next/link';
import Image from 'next/image';
import { RefObject, useState } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { Anime } from '../lib/types';

export interface AnimeCardProps {
  anime: Anime;
  cardRef: RefObject<HTMLDivElement | null>;
  iconType?: 'plus' | 'minus';
  onSelect?: (anime: Anime) => void;
  onRemove?: (anime: Anime) => void;
  priority?: boolean; // Add priority prop if you need LCP optimization
}

const AnimeCard: React.FC<AnimeCardProps> = ({
  anime,
  cardRef,
  iconType,
  onSelect,
  onRemove,
  priority
}) => {
  const [visible, setVisible] = useState(true);

  const handleClick = () => {
    setVisible(false);
    setTimeout(() => {
      if (iconType === 'plus' && onSelect) {
        onSelect(anime);
      } else if (iconType === 'minus' && onRemove) {
        onRemove(anime);
      }
    }, 300);
  };

  return (
    <div
      key={anime.anime_id}
      className={`ml-4 anime-card ${visible ? 'fade-in' : 'fade-out'}`}
      ref={cardRef}
    >
      <div
        className="cursor-pointer min-w-[200px] h-[300px] relative rounded-lg overflow-hidden 
                   hover:shadow-lg transition-transform duration-300 ease-in-out group mt-4 mb-4 mr-6"
        style={{
          transform: 'scale(1)',
          transition: 'transform 0.3s ease',
          color: 'black',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <Link href={`/anime/${anime.anime_id}`} style={{ textDecoration: 'none' }}>
          <Image
            src={anime.image_url || '/placeholder.png'}
            alt={anime.English || anime.Japanese || 'No title'}
            fill
            className="object-cover rounded-lg"
            priority={priority} // Adds LCP priority if needed
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
            <div className="text-lg font-bold">
              {anime.English || anime.Japanese || 'No title'}
            </div>
          </div>
        </Link>

        <div
          className="absolute top-2 right-2 bg-white p-1 rounded-full cursor-pointer z-10"
          onClick={(e) => {
            e.stopPropagation(); // Prevent clicking the icon from triggering the link
            handleClick();
          }}
        >
          {iconType === 'plus' ? <FaPlus color="black" /> : <FaMinus color="black" />}
        </div>
      </div>
    </div>
  );
};

export default AnimeCard;

// filepath: /c:/Users/berka/Masters/TNM108/project/animatch/lib/types.ts
export interface Anime {
    anime_id: number;
    English?: string;
    Japanese?: string;
    image_url?: string;
    title?: string;
    Description?: string;
    Genres?: string[];
    rating?: number;
    Popularity?: number;
    Rank?: number;
    bert_description?: number[];
    bert_genres?: number[];
    bert_demographic?: number[];
    bert_rating?: number[];
    bert_themes?: number[];
  }
  
  export interface Recommendation {
    anime_id: number;
    title: string;
    similarity: number;
  }
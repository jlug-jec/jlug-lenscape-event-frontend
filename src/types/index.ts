export type MainCategory = 
  | 'photography'
  | 'digital-art'
  | 'cinematography'
  | 'motion-graphics';

export type SubCategory = 
  | 'portrait-photography'
  | 'landscape-photography'
  | 'concept-art'
  | 'character-design'
  | 'short-film'
  | 'travel-film'
  | 'logo-animation'
  | 'explainer-video';

export type Category = MainCategory | SubCategory;

/**
 * Aspect ratio the artist picked on the submission form. Kept as the source of
 * truth for how a work is framed, so nothing is ever cropped to fit.
 */
export type Orientation =
  | 'landscape'   // 3:2
  | 'portrait'    // 2:3
  | 'square'      // 1:1
  | 'widescreen'  // 16:9
  | 'vertical';   // 9:16

/** width / height for each submitted orientation. */
export const ORIENTATION_RATIO: Record<Orientation, number> = {
  landscape: 3 / 2,
  portrait: 2 / 3,
  square: 1,
  widescreen: 16 / 9,
  vertical: 9 / 16,
};

/** Resolves any stored orientation string to a usable ratio. */
export function ratioOf(orientation?: string | null, fallback = 3 / 2): number {
  if (!orientation) return fallback;
  return ORIENTATION_RATIO[orientation as Orientation] ?? fallback;
}

export interface Artist {
  id: string;
  name: string;
  email: string;
  college: string;
  branch: string;
  year: string;
  avatar: string | null;
  bio: string;
  joinedDate: Date;
}

export interface Artwork {
  id: string;
  title: string;
  description: string;
  category: MainCategory; // Main category only
  subCategory?: SubCategory; // Optional subcategory
  imageUrl: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  /** Aspect ratio chosen by the artist at submission time. */
  orientation?: Orientation;
  artist: Artist;
  votes: number;
  comments: Comment[];
  createdAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Comment {
  id: string;
  artworkId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  college: string;
  branch: string;
  year: string;
  avatar: string | null;
  bio: string;
  votedCategories: MainCategory[]; // Only main categories for voting
  commentedArtworks: string[];
  submissions: Artwork[];
  achievements: Achievement[];
  joinedDate: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

export interface Vote {
  id: string;
  artworkId: string;
  userId: string;
  category: MainCategory; // Only main categories
  createdAt: Date;
}

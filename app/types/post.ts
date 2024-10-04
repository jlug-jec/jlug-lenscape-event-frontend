
export interface Post {
    _id: string;
    id: string;
    title: string;
    category: 'photography' | 'videography' | 'digital art';
    url: string;
    likes: number;
    domain: string;
    votes: string[],
    type: 'image' | 'video';
  }
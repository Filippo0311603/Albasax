
export interface TourDate {
  id: string;
  date: string;
  venue: string;
  location: string;
  status: 'Available' | 'Sold Out' | 'Canceled';
  ticketUrl: string;
}

export interface MusicRelease {
  id: string;
  title: string;
  year: string;
  coverUrl: string;
  type: 'Album' | 'Single' | 'EP';
  links: {
    spotify: string;
    apple: string;
  };
}

export interface PressArticle {
  id: string;
  title: string;
  outlet: string;
  date: string;
  excerpt: string;
  content: string; // New field for full article text
  url?: string;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
}

export interface User {
  email: string;
  name: string;
}

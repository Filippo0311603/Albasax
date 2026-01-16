
import { TourDate, MusicRelease, PressArticle, MediaItem } from './types';

export const TOUR_DATES: TourDate[] = [
  { id: '1', date: '2024-08-15', venue: 'Jazz Blue Club', location: 'London, UK', status: 'Available', ticketUrl: '#' },
  { id: '2', date: '2024-09-02', venue: 'Royal Albert Hall', location: 'London, UK', status: 'Sold Out', ticketUrl: '#' },
  { id: '3', date: '2024-09-20', venue: 'Blue Note', location: 'New York, USA', status: 'Available', ticketUrl: '#' },
  { id: '4', date: '2024-10-05', venue: 'Le Trianon', location: 'Paris, France', status: 'Available', ticketUrl: '#' },
  { id: '5', date: '2024-11-12', venue: 'Teatro degli Arcimboldi', location: 'Milan, Italy', status: 'Available', ticketUrl: '#' },
];

export const MUSIC_RELEASES: MusicRelease[] = [
  {
    id: '1',
    title: 'Midnight Echoes',
    year: '2024',
    type: 'Album',
    coverUrl: 'https://picsum.photos/seed/music1/600/600',
    links: { spotify: '#', apple: '#' }
  },
  {
    id: '2',
    title: 'Velvet Sky',
    year: '2023',
    type: 'EP',
    coverUrl: 'https://picsum.photos/seed/music2/600/600',
    links: { spotify: '#', apple: '#' }
  },
  {
    id: '3',
    title: 'Neon Saxophone',
    year: '2023',
    type: 'Single',
    coverUrl: 'https://picsum.photos/seed/music3/600/600',
    links: { spotify: '#', apple: '#' }
  },
];

export const PRESS_ARTICLES: PressArticle[] = [
  {
    id: '1',
    title: 'Albasax: The Future of Contemporary Jazz',
    outlet: 'The Guardian',
    date: 'June 12, 2024',
    excerpt: 'A breathtaking performance that redefines what a saxophone can do in the 21st century.',
    url: '#'
  },
  {
    id: '2',
    title: 'Inside the Mind of Albasax',
    outlet: 'Rolling Stone',
    date: 'May 05, 2024',
    excerpt: 'An exclusive look at the inspirations behind the chart-topping album Midnight Echoes.',
    url: '#'
  },
  {
    id: '3',
    title: 'Tour Review: Sold Out Night at the Opera House',
    outlet: 'Pitchfork',
    date: 'April 20, 2024',
    excerpt: 'An immersive experience that blends visuals and sound in a way we\'ve never seen before.',
    url: '#'
  },
];

export const MEDIA_GALLERY: MediaItem[] = [
  { id: '1', type: 'image', url: 'https://picsum.photos/seed/sax1/1200/800', title: 'Live at Glastonbury' },
  { id: '2', type: 'image', url: 'https://picsum.photos/seed/sax2/800/1200', title: 'Studio Session' },
  { id: '3', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnail: 'https://picsum.photos/seed/vid1/1200/800', title: 'Official Music Video' },
  { id: '4', type: 'image', url: 'https://picsum.photos/seed/sax3/1200/800', title: 'World Tour 2024' },
  { id: '5', type: 'image', url: 'https://picsum.photos/seed/sax4/1200/1200', title: 'Behind the Scenes' },
];

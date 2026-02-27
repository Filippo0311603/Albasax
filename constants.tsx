
import { TourDate, MusicRelease, PressArticle, MediaItem, Dancer } from './types';

export const TOUR_DATES: TourDate[] = [];


export const MUSIC_RELEASES: MusicRelease[] = [
  {
    id: '1',
    title: 'Mi Volevi Affondare',
    year: '2023',
    type: 'Single',
    coverUrl: '/MI_VOLEVI_AFF.webp',
    links: { spotify: 'https://open.spotify.com/intl-it/track/0Nn5dRbcPM3b5kvivNe6iD', apple: 'https://music.apple.com/it/album/mi-volevi-affondare/1678175777?i=1678175778' }
  },
  {
    id: '2',
    title: 'Stringimi e Dimmi che Sarà per Sempre',
    year: '2023',
    type: 'Single',
    coverUrl: '/STRINGIMI.webp',
    links: { spotify: 'https://open.spotify.com/intl-it/track/3pY5qgCr6JVPt0eGvsOMMk', apple: 'https://music.apple.com/it/album/stringimi-e-dimmi-che-sar%C3%A0-per-sempre/1694490959?i=1694490960' }
  },
];

export const PRESS_ARTICLES: PressArticle[] = [
  {
    id: '1',
    title: 'Albasax, the new musical chapter is: Stringimi e dimmi che sarà per sempre',
    outlet: 'Panorama',
    date: 'July 28, 2023',
    excerpt: 'Love Addiction, written with Vasco\'s son, Davide Rossi. Collaborating with Davide Rossi was a huge achievement, as well as a great honor.',
    imageUrl: '/STRINGIMI.webp',
    url: 'https://www.panorama.it/lifestyle/albasax-il-nuovo-capitolo-musicale-e-stringimi-e-dimmi-che-sara-per-sempre'
  },
  {
    id: '2',
    title: '"Mi volevi affondare" is the rebirth of Albasax',
    outlet: 'Sky TG24',
    date: 'March 20, 2023',
    excerpt: 'Danceable electro-pop where the saxophone takes center stage, a luminous video by Armando Cattarinich. This first work by the Roman artist reflects a profound personal introspection.',
    imageUrl: '/MI_VOLEVI_AFF.webp',
    url: 'https://tg24.sky.it/spettacolo/musica/2023/03/20/albasax-mi-volevi-affondare-video'
  },
];

export const MEDIA_GALLERY: MediaItem[] = [
  { id: '1', type: 'image', url: '/IMG_2492.webp', title: 'Live Performance' },
  { id: '2', type: 'image', url: '/foto1.webp', title: 'Concert Moment' },
  { id: '3', type: 'image', url: '/foto2.webp', title: 'On Stage' },
  { id: '4', type: 'image', url: '/Ballo.webp', title: 'Backstage' },
  { id: '5', type: 'image', url: '/foto3.webp', title: 'Live Session' },
  { id: '6', type: 'image', url: '/foto4.webp', title: 'Artist Portrait' },
];

export const DANCERS: Dancer[] = [
  { id: '1', firstName: 'Arianna', lastName: 'Del Mastro', photoUrl: '/dancers/arianna-del-mastro.webp' },
  { id: '2', firstName: 'Morgana', lastName: 'Tomassi', photoUrl: '/dancers/morgana-tomassi.webp' },
  { id: '3', firstName: 'Nicole', lastName: 'Vinci', photoUrl: '/dancers/nicole-vinci.webp' },
  { id: '4', firstName: 'Alessia', lastName: 'Comito', photoUrl: '/dancers/alessia-comito.webp' },
  { id: '5', firstName: 'Irene', lastName: 'Mosquera', photoUrl: '/dancers/irene-mosquera.webp' },
  { id: '6', firstName: 'Sarah', lastName: 'Cosac', photoUrl: '/dancers/sarah-cosac.webp' },
];

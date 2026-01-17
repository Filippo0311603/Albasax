
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
    title: 'Mi Volevi Affondare',
    year: '2023',
    type: 'Single',
    coverUrl: '/MI_VOLEVI_AFF.webp',
    links: { spotify: 'https://open.spotify.com/intl-it/track/0Nn5dRbcPM3b5kvivNe6iD', apple: '#' }
  },
  {
    id: '2',
    title: 'Stringimi e Dimmi che Sarà per Sempre',
    year: '2023',
    type: 'Single',
    coverUrl: '/STRINGIMI.webp',
    links: { spotify: 'https://open.spotify.com/intl-it/track/3pY5qgCr6JVPt0eGvsOMMk', apple: '#' }
  },
];

export const PRESS_ARTICLES: PressArticle[] = [
  {
    id: '1',
    title: 'Albasax, the new musical chapter is: Stringimi e dimmi che sarà per sempre',
    outlet: 'Panorama',
    date: 'July 28, 2023',
    excerpt: 'Love Addiction, written with Vasco\'s son, Davide Rossi.',
    content: `
Collaborating with Davide Rossi was a huge achievement for me, as well as a great honor that I will carry with me throughout my career... I met a special person, extremely open and willing to discuss things. He, too, is a lover of electronic music, and has given me so much artistically (and personally); I love his lyrics and the way he approaches music. When I received the call from my producer Federico Paciotti suggesting this collaboration, I almost couldn't believe it... I took a few minutes to think about it and then called him back immediately to start producing the piece... I was thrilled, haha ​​:) I believe collaborations are a fundamental part of a project because they enrich the project but, above all, the life of the artist himself.

For an artist like Albasax, born Daniele Dominici, a Roman singer-songwriter, multi-instrumentalist, and performer who graduated from the Santa Cecilia Conservatory, it's easy to see how music is everything—even, as he himself says, a disease. Equally true is his enthusiasm for his collaboration with Davide Rossi, son of the great Vasco Rossi, evident in his words, just quoted here. Less obvious is the fact that a multi-instrumentalist, emerging from the academic world, is drawn to musical worlds light years away from his theoretical studies. His statements about Davide Rossi reveal the singer-songwriter's rock soul. But it quickly becomes clear that EDM, an electro dance music, is the true territory of the artist who grew up on the Lazio coast. And while this musical territory is often associated with repetitive and redundant formulas, Albasax surprises us. The LED suit she wears and performs in, which lights up in time to the music, was conceived and designed with her mother, and is an expression of her visionary spirit, not without a hint of madness, which animates her live concerts, authentic multisensory events offering an emotional and immersive experience. And she adds her voice, exposes herself, and has remarkable talents as a musician.

The sax in his stage name is a perfect match for electronic music. The single "Stringimi e dimmi che sarà per sempre" Forever. Never. The absolutes of time, whether by addition or subtraction, abound on our lips as teenagers. Starting from this consideration, Albasax wanted to write "Hold me and tell me it will be forever." Especially when it comes to love, with the person he loves (the song is a special dedication to the wonderful relationship he is currently experiencing, which has made his life more beautiful and gives meaning to the songs he writes), and the phrase "hold me and tell me it will be forever" captures the very paradox of forever tending towards infinity, when we know that everything in life is over. In this cry of desperation, the Roman singer-songwriter asks music to hold him close. Produced by Federico Paciotti, the song features considerable collaboration with Davide Rossi. This is what Davide Rossi says about Albasax: A dedicated, serious, humble artist, in love with what he is doing, to whom I willingly and affectionately dedicate this song written from the heart for music... Voice, Sax and Console, Albasax, he brings together all the elements of EDM, his own universe.

It's a special dedication to the most important thing in his "illness," as the song says: music! Anyone who has a dream as big and strong as his lives daily with the doubt of whether, once they've achieved their goal, it will all last forever. Daniele/Albasax wrote this song thinking of the many people like him who fight every day to make their dreams come true, sacrificing so much, but also for those who, at least once in their lives, have felt alone, overwhelmed by problems they didn't think they could even remotely solve. Between instrumental and vocal parts, Stringimi is a liberating song, which demands above all to be danced. The song features an instrumental part in which synthesizers play a simple but easily memorable riff that represents what the artist likes to call "THE PARTY," where he lets himself go and dance, a bit like the great idols he draws inspiration from (Avicil, Lady Gaga, David Guetta, Timmy Trumpet, and Afro Jack). It is precisely through the body movement induced by the song that the music allows us to hold each other close and embrace each other. Between nostalgia and illness. The single is accompanied by a video directed by Giulio Bottini.
    `,
    url: '#'
  },
  {
    id: '2',
    title: '"Mi volevi affondare" is the rebirth of Albasax',
    outlet: 'Sky TG24',
    date: 'March 20, 2023',
    excerpt: 'Danceable electro-pop where the saxophone takes center stage, a luminous video by Armando Cattarinich. This first work by the Roman artist reflects a profound personal introspection.',
    content: `
I'm Daniele Dominici, aka Albasax, and I live for music and dreams. For me, music has always been the key to happiness and the focal point of an inner rebirth, which I desperately sought for a long time, fighting with all my might. A few years ago, I experienced a sudden, profound separation, and I immediately realized that from that moment on, I would have to expect dramatic and traumatic consequences that would mark me for the rest of my life. I spent entire nights trying to find answers to unanswerable questions, but there was nothing I could do; I had to find an answer at all costs. I still remember that one of the things I repeated to myself most was: "Maybe I'm not enough... I did everything wrong." As time went by, I began to realize that I had no one around me to vent to, except my family, to whom, however, I never really told the whole story of my situation. This was because I didn't want them to suffer more than they already did. One of the worst moments of my life for me had become the evening. It was precisely the moment I crawled into bed under the covers and turned off the light that my thoughts would come flooding back, making a great noise despite all the silence around me. I remember perfectly how, on those evenings, life came knocking on my door to demand its bill, a bill I perhaps never thought I could pay because I felt inadequate, alone, and incapable of doing anything.

My new single "Mi volevi affondare" is precisely about this. It's about my rebirth, born from an urgent need to shout out to people everything I'd kept inside for months, or perhaps years, to make them understand that even in extreme, dramatic situations, there's always a way to emerge better than before. The song was created with my producer Federico Paciotti in March of last year. A personal need, and since I strongly believe in the power of a song, I thought that composing a danceable track could give people a chance to detach themselves from reality for just over three minutes and indulge in a little fun.

Releasing a song is never easy, especially when it's such a personal piece that tells a true story, laying you completely bare, but I always try to focus on what people actually choose to make of my songs. This is my first single, but I'm working on a full-length album inspired by my great idols: Ed Sheeran and Lady Gaga. I'll never stop dreaming of meeting them and working to become like them. I owe it to my music, but above all to myself, for having unfairly humiliated myself, and I hope this song can be helpful to those many who never feel like they're good enough.
    `,
    url: '#'
  },
];

export const MEDIA_GALLERY: MediaItem[] = [
  { id: '1', type: 'image', url: '/IMG_2492.webp', title: 'Live Performance' },
  { id: '2', type: 'image', url: '/IMG_2493.webp', title: 'Concert Moment' },
  { id: '3', type: 'image', url: '/IMG_2494.webp', title: 'On Stage' },
  { id: '4', type: 'image', url: '/IMG_2495.webp', title: 'Backstage' },
  { id: '5', type: 'image', url: '/IMG_2496.webp', title: 'Live Session' },
  { id: '6', type: 'image', url: '/IMG_2497.webp', title: 'Artist Portrait' },
];

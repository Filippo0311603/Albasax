
import React from 'react';
import { Instagram, Youtube, Facebook, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Newsletter from './Newsletter';

// Icone custom per Spotify e Apple Music
const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

const AppleMusicIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1c.822-.106 1.596-.35 2.295-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.042-1.8-.6-1.965-1.483-.18-.965.39-1.944 1.343-2.262.547-.18 1.117-.262 1.684-.336.3-.04.6-.09.896-.168.197-.052.346-.186.385-.394.012-.063.016-.13.016-.194V9.93a.54.54 0 00-.006-.084c-.03-.177-.133-.273-.333-.227-.085.02-.17.044-.254.07l-4.86 1.348c-.164.046-.182.068-.182.237v7.04c0 .258-.028.513-.108.762-.22.68-.67 1.148-1.33 1.418-.37.15-.762.22-1.16.25-.642.05-1.25-.04-1.8-.39-.528-.337-.816-.824-.896-1.44-.076-.587.12-1.1.524-1.523.37-.387.84-.593 1.362-.714.39-.09.784-.13 1.178-.19.197-.03.394-.063.584-.117.257-.073.4-.24.42-.507.004-.056.004-.114.004-.17V6.524c0-.04.006-.083.012-.122.03-.207.148-.33.35-.38l.136-.032 6.096-1.69c.136-.037.273-.075.413-.096.27-.04.443.1.47.377.005.058.006.117.006.175v5.355z"/>
  </svg>
);

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black border-t border-gray-900 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <img 
                src="/logo_alb.webp" 
                alt="Albasax Logo" 
                className="h-10 w-auto"
                loading="lazy"
              />
              <h2 className="text-2xl font-serif tracking-widest uppercase font-bold text-white leading-none translate-y-[3px]">
                Albasax
              </h2>
            </div>
            <p className="text-gray-400 max-w-md leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex space-x-6">
              <a href="https://www.instagram.com/albasax_official/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gold transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://www.youtube.com/channel/UCIpGeq5gMj7GVYxoHaVlwsg" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gold transition-colors">
                <Youtube size={20} />
              </a>
              <a href="https://www.facebook.com/profile.php?id=100063638557257&locale=it_IT" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gold transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://open.spotify.com/intl-it/artist/3aOCpeC6zsfwRk6C62d6aL" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gold transition-colors">
                <SpotifyIcon />
              </a>
              <a href="https://music.apple.com/it/artist/albasax/1596944365" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gold transition-colors">
                <AppleMusicIcon />
              </a>
            </div>
          </div>
          
          <div>
            <Newsletter />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-gray-900 gap-6">
          <p className="text-gray-600 text-xs tracking-widest uppercase">
            &copy; {new Date().getFullYear()} Albasax Music. {t('footer.copyright')}
          </p>
          
          <div className="flex space-x-8">
            <Link to="/legal/privacy" className="text-gray-600 hover:text-white text-[10px] uppercase tracking-[0.2em]">{t('footer.privacy')}</Link>
            <Link to="/legal/terms" className="text-gray-600 hover:text-white text-[10px] uppercase tracking-[0.2em]">{t('footer.terms')}</Link>
            <Link to="/legal/cookies" className="text-gray-600 hover:text-white text-[10px] uppercase tracking-[0.2em]">{t('footer.cookies')}</Link>
          </div>

          <button 
            onClick={scrollToTop}
            className="p-3 border border-gray-800 hover:border-gold transition-all group"
          >
            <ArrowUp size={16} className="text-gray-500 group-hover:text-gold" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

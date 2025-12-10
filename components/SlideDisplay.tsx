import React, { useEffect, useState } from 'react';
import { VerseData, PresentationSettings, ThemeMode } from '../types';
import { Minimize2, Maximize2, Wifi } from 'lucide-react';

interface SlideDisplayProps {
  verse: VerseData | null;
  settings: PresentationSettings;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  isLoading: boolean;
  loadingMessage?: string;
  isLive: boolean; 
}

const SlideDisplay: React.FC<SlideDisplayProps> = ({ 
  verse, 
  settings, 
  isFullscreen, 
  toggleFullscreen,
  isLoading,
  loadingMessage,
  isLive
}) => {
  const [animateKey, setAnimateKey] = useState(0);

  useEffect(() => {
    if (verse) {
      setAnimateKey(prev => prev + 1);
    }
  }, [verse]);

  const getThemeClasses = (theme: ThemeMode) => {
    switch (theme) {
      case ThemeMode.Classic: return 'bg-[#1e3a8a] text-white font-serif';
      case ThemeMode.Modern: return 'bg-slate-900 text-white font-sans';
      case ThemeMode.Nature: return 'bg-emerald-950 text-emerald-50 font-serif';
      case ThemeMode.Light: return 'bg-white text-gray-900 font-serif';
      case ThemeMode.Dark: default: return 'bg-black text-white font-sans';
    }
  };

  const getAlignmentClass = (align: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'left': return 'text-left';
      case 'right': return 'text-right';
      default: return 'text-center';
    }
  };

  const containerClass = `
    relative flex flex-col items-center justify-center w-full h-full p-8 md:p-16 transition-colors duration-700 overflow-hidden
    ${getThemeClasses(settings.theme)}
  `;

  const fontSizeStyle = { fontSize: `${settings.fontSize}rem`, lineHeight: '1.4' };

  // Empty State (No Verse)
  if (!verse && !isLoading) {
    return (
      <div className={`relative flex flex-col items-center justify-center w-full h-full bg-navy-900 overflow-hidden`}>
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         <div className="relative z-10 text-center space-y-6 animate-fadeIn">
            {isLive ? (
              <>
                 <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
                    <div className="relative bg-navy-600 p-4 rounded-full text-white shadow-xl border border-navy-400">
                       <Wifi size={40} />
                    </div>
                 </div>
                 <h1 className="text-4xl font-display text-blue-200 tracking-wider">Live Display Active</h1>
                 <p className="text-xl text-blue-300 font-light">Waiting for operator...</p>
              </>
            ) : (
              <>
                <h1 className="text-6xl font-display text-blue-200 tracking-wider">Mormon Scripture Presenter</h1>
                <div className="w-24 h-1 bg-blue-400 mx-auto rounded-full opacity-50"></div>
                <p className="text-xl text-blue-300 font-light tracking-wide">Ready to present.</p>
              </>
            )}
        </div>
      </div>
    );
  }

  return (
    <div id="presentation-area" className={containerClass}>
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
      
      {isLive && (
        <button 
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/50 hover:text-white transition-all z-50"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
        </button>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-40 backdrop-blur-sm">
           <div className="flex flex-col items-center">
             <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400 mb-4"></div>
             <span className="text-blue-200 font-display tracking-widest text-lg animate-pulse">
               {loadingMessage || "SEARCHING"}
             </span>
           </div>
        </div>
      )}

      {verse && (
        <div 
            key={animateKey} 
            className={`z-30 max-w-[90%] w-full ${getAlignmentClass(settings.alignment)} animate-[fadeIn_400ms_ease-out]`}
        >
          <div className="font-medium mb-12 tracking-wide drop-shadow-lg leading-relaxed text-balance" style={fontSizeStyle}>
            {verse.text}
          </div>
          {settings.showReference && (
            <div className="mt-12 border-t border-current/20 pt-8 inline-block w-full">
              <h2 className="text-5xl md:text-7xl font-display text-blue-200 tracking-wider uppercase">
                {verse.reference}
              </h2>
              <p className="text-xl opacity-70 mt-3 uppercase tracking-[0.2em] font-sans font-light">{verse.version}</p>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

export default SlideDisplay;
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ControlPanel from './components/ControlPanel';
import SlideDisplay from './components/SlideDisplay';
import { VerseData, AIInsight, PresentationSettings, ThemeMode, HistoryItem, BroadcastMessage } from './types';
import { getVerseInsights } from './services/geminiService';
import { findScripture } from './services/scriptureService';

const BROADCAST_CHANNEL_NAME = 'lumina_live_channel';

const App: React.FC = () => {
  // --- State ---
  const [currentVerse, setCurrentVerse] = useState<VerseData | null>(null);
  const [currentInsight, setCurrentInsight] = useState<AIInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>(''); // NEW: Custom loading text
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [isReceiverMode, setIsReceiverMode] = useState(false);

  // Broadcast Channel
  const channel = useMemo(() => new BroadcastChannel(BROADCAST_CHANNEL_NAME), []);

  // History & Settings
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('lumina_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<PresentationSettings>(() => {
    const saved = localStorage.getItem('lumina_settings');
    return saved ? JSON.parse(saved) : {
      fontSize: 3.5,
      theme: ThemeMode.Classic,
      showReference: true,
      alignment: 'center'
    };
  });

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.5);

  // --- Effects ---

  useEffect(() => {
    const url = new URL(window.location.href);
    const isReceiver = url.searchParams.get('mode') === 'live';
    setIsReceiverMode(isReceiver);

    if (isReceiver) {
      setConnectionStatus('connected');
      const handleMessage = (event: MessageEvent<BroadcastMessage>) => {
        if (event.data.type === 'STATE_UPDATE') {
          setCurrentVerse(event.data.payload.verse);
          setSettings(event.data.payload.settings);
        }
      };
      channel.onmessage = handleMessage;
      channel.postMessage({ type: 'REQUEST_STATE' });
    } else {
      const handleMessage = (event: MessageEvent<BroadcastMessage>) => {
        if (event.data.type === 'REQUEST_STATE') {
          channel.postMessage({
            type: 'STATE_UPDATE',
            payload: { verse: currentVerse, settings }
          });
        }
      };
      channel.onmessage = handleMessage;
    }

    return () => { channel.onmessage = null; };
  }, [channel, currentVerse, settings]);

  useEffect(() => {
    if (!isReceiverMode) {
      channel.postMessage({
        type: 'STATE_UPDATE',
        payload: { verse: currentVerse, settings }
      });
      localStorage.setItem('lumina_settings', JSON.stringify(settings));
    }
  }, [currentVerse, settings, isReceiverMode, channel]);

  useEffect(() => {
    if (!isReceiverMode) {
      localStorage.setItem('lumina_history', JSON.stringify(history));
    }
  }, [history, isReceiverMode]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (isReceiverMode) return;
    const calculateScale = () => {
      if (previewContainerRef.current) {
        const { clientWidth, clientHeight } = previewContainerRef.current;
        const TARGET_WIDTH = 1920;
        const TARGET_HEIGHT = 1080;
        const scaleX = clientWidth / TARGET_WIDTH;
        const scaleY = clientHeight / TARGET_HEIGHT;
        const scale = Math.min(scaleX, scaleY) * 0.90;
        setPreviewScale(scale);
      }
    };
    window.addEventListener('resize', calculateScale);
    calculateScale();
    const interval = setInterval(calculateScale, 1000);
    return () => {
      window.removeEventListener('resize', calculateScale);
      clearInterval(interval);
    };
  }, [isReceiverMode]);

  // --- Handlers ---

  const handleUpdateSettings = (newSettings: Partial<PresentationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleFullscreen = async () => {
    const elem = document.getElementById('presentation-container');
    if (!elem) return;
    if (!document.fullscreenElement) {
      await elem.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const fetchInsightsForVerse = useCallback(async (verse: VerseData) => {
      setCurrentInsight(null); 
      if (navigator.onLine && process.env.API_KEY) {
        const insight = await getVerseInsights(verse.reference, verse.text);
        setCurrentInsight(insight);
      }
  }, []);

  const addToHistory = (verse: VerseData) => {
    setHistory(prev => {
        const newHistory = [
          { id: Date.now().toString(), verse, timestamp: Date.now() },
          ...prev.filter(h => h.verse.reference !== verse.reference)
        ].slice(0, 20); 
        return newHistory;
      });
  }

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setLoadingMessage(''); // Reset
    
    // Hint to user if they are searching BoM for first time without key
    if (!process.env.API_KEY && (query.toLowerCase().includes('alma') || query.toLowerCase().includes('nephi') || query.toLowerCase().includes('moroni'))) {
       setLoadingMessage('DOWNLOADING LIBRARY...');
    }

    try {
      const verse = await findScripture(query);
      setCurrentVerse(verse);
      addToHistory(verse);
      fetchInsightsForVerse(verse);
    } catch (error: any) {
      alert(error.message || "Could not find verse.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleManualPresent = (verse: VerseData) => {
    setCurrentVerse(verse);
    addToHistory(verse);
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setCurrentVerse(item.verse);
    fetchInsightsForVerse(item.verse);
  };

  const handleLaunchLive = () => {
    const width = 1280;
    const height = 720;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'live');
    try {
      window.open(url.toString(), 'MormonScripturePresenterLive', `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`);
    } catch (e) {
      alert("Error opening window.");
    }
  };

  const handleNavigateVerse = async (direction: 'next' | 'prev') => {
    if (!currentVerse) return;
    const regex = /^(.+)\s+(\d+):(\d+)$/;
    const match = currentVerse.reference.match(regex);
    if (match) {
      const book = match[1].trim();
      const chapter = parseInt(match[2]);
      const verse = parseInt(match[3]);
      const newVerseNum = direction === 'next' ? verse + 1 : verse - 1;
      if (newVerseNum < 1) return;
      const newQuery = `${book} ${chapter}:${newVerseNum}`;
      
      setIsLoading(true);
      try {
        const verse = await findScripture(newQuery);
        setCurrentVerse(verse);
        addToHistory(verse);
        fetchInsightsForVerse(verse);
      } catch (err: any) {
         // Graceful failure for end of chapter
         if(err.message.includes('not found')) {
             console.log("End of chapter or content unavailable");
         }
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      if (isReceiverMode) return;
      if (e.key === 'ArrowRight') handleNavigateVerse('next');
      if (e.key === 'ArrowLeft') handleNavigateVerse('prev');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVerse, isReceiverMode]); 

  // --- RENDER ---
  
  if (isReceiverMode) {
    return (
      <div id="presentation-container" className="h-screen w-screen bg-black overflow-hidden relative">
        <SlideDisplay 
          verse={currentVerse}
          settings={settings}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
          isLoading={false}
          isLive={true}
          loadingMessage=""
        />
        {!currentVerse && (
          <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black/50 px-3 py-1 rounded text-xs text-gray-500 font-mono">
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-black overflow-hidden font-sans">
      <div className={`transition-all duration-300 w-full md:w-96 flex-shrink-0 z-20 flex flex-col h-full bg-gray-950 border-r border-gray-800`}>
        <ControlPanel 
          onSearch={handleSearch}
          isLoading={isLoading}
          currentVerse={currentVerse}
          insight={currentInsight}
          settings={settings}
          updateSettings={handleUpdateSettings}
          history={history}
          onSelectHistory={handleSelectHistory}
          onLaunchLive={handleLaunchLive}
          onManualPresent={handleManualPresent}
          onNext={() => handleNavigateVerse('next')}
          onPrev={() => handleNavigateVerse('prev')}
        />
      </div>
      <div className="flex-1 relative h-full bg-gray-900 flex flex-col">
        <div className="flex-none p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center text-gray-400 text-xs uppercase tracking-widest font-bold z-10">
           <span>Live Preview Console</span>
           <span className="flex items-center text-green-500 gap-2">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> 
             System Active
           </span>
        </div>
        <div className="flex-1 relative bg-gray-950 overflow-hidden" ref={previewContainerRef}>
          <div 
            style={{ 
              width: '1920px', 
              height: '1080px', 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) scale(${previewScale})`,
              transformOrigin: 'center center',
            }}
            className="shadow-2xl border-2 border-gray-700 bg-black overflow-hidden flex-shrink-0 transition-transform duration-100 ease-out"
          >
            <SlideDisplay 
              verse={currentVerse}
              settings={settings}
              isFullscreen={false}
              toggleFullscreen={() => {}} 
              isLoading={isLoading}
              loadingMessage={loadingMessage}
              isLive={false}
            />
          </div>
          <div className="absolute bottom-4 right-4 text-xs font-bold text-white/10 uppercase pointer-events-none select-none">
             1920x1080 Scaled Preview
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
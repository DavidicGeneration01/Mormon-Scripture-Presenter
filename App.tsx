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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');
  
  // Detect "Live Mode" (Receiver Window) via URL
  const [isReceiverMode, setIsReceiverMode] = useState(false);

  // Broadcast Channel
  const channel = useMemo(() => new BroadcastChannel(BROADCAST_CHANNEL_NAME), []);

  // History
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('lumina_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Settings
  const [settings, setSettings] = useState<PresentationSettings>(() => {
    const saved = localStorage.getItem('lumina_settings');
    return saved ? JSON.parse(saved) : {
      fontSize: 3.5,
      theme: ThemeMode.Classic,
      showReference: true,
      alignment: 'center'
    };
  });

  // Preview Scaling State
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.5);

  // --- Effects ---

  // 1. Initialize Mode & Receiver Logic
  useEffect(() => {
    // Parse query params from the full URL to handle hash routing or clean URLs correctly
    const url = new URL(window.location.href);
    const isReceiver = url.searchParams.get('mode') === 'live';
    setIsReceiverMode(isReceiver);

    if (isReceiver) {
      setConnectionStatus('connected'); // Assume connected if channel works
      // Receiver Mode: Listen for updates
      const handleMessage = (event: MessageEvent<BroadcastMessage>) => {
        if (event.data.type === 'STATE_UPDATE') {
          setCurrentVerse(event.data.payload.verse);
          setSettings(event.data.payload.settings);
        }
      };
      channel.onmessage = handleMessage;
      
      // Request initial state
      channel.postMessage({ type: 'REQUEST_STATE' });
    } else {
      // Sender Mode: Listen for requests from new windows
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

    return () => {
      channel.onmessage = null;
    };
  }, [channel, currentVerse, settings]);

  // 2. Sender Mode: Broadcast changes when Verse or Settings change
  useEffect(() => {
    if (!isReceiverMode) {
      channel.postMessage({
        type: 'STATE_UPDATE',
        payload: { verse: currentVerse, settings }
      });
      localStorage.setItem('lumina_settings', JSON.stringify(settings));
    }
  }, [currentVerse, settings, isReceiverMode, channel]);

  // 3. Persist history (Operator only)
  useEffect(() => {
    if (!isReceiverMode) {
      localStorage.setItem('lumina_history', JSON.stringify(history));
    }
  }, [history, isReceiverMode]);

  // 4. Handle Fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 5. Handle Preview Scaling (Operator only)
  useEffect(() => {
    if (isReceiverMode) return;

    const calculateScale = () => {
      if (previewContainerRef.current) {
        const { clientWidth, clientHeight } = previewContainerRef.current;
        const TARGET_WIDTH = 1920;
        const TARGET_HEIGHT = 1080;
        
        // Calculate scale to fit CONTAIN within the available space
        const scaleX = clientWidth / TARGET_WIDTH;
        const scaleY = clientHeight / TARGET_HEIGHT;
        const scale = Math.min(scaleX, scaleY) * 0.90; // 0.90 margin
        
        setPreviewScale(scale);
      }
    };

    window.addEventListener('resize', calculateScale);
    calculateScale(); // Initial calculation
    
    // Safety check loop for layout shifts
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
      try {
        await elem.requestFullscreen();
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const fetchInsightsForVerse = useCallback(async (verse: VerseData) => {
      setCurrentInsight(null); 
      // Only fetch if online
      if (navigator.onLine) {
        const insight = await getVerseInsights(verse.reference, verse.text);
        setCurrentInsight(insight);
      } else {
        // Silent fail or set offline status for insights
        console.log("Offline: Skipping insight generation.");
      }
  }, []);

  const addToHistory = (verse: VerseData) => {
    setHistory(prev => {
        const newHistory = [
          { id: Date.now().toString(), verse, timestamp: Date.now() },
          // Remove duplicates
          ...prev.filter(h => h.verse.reference !== verse.reference)
        ].slice(0, 20); 
        return newHistory;
      });
  }

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    try {
      // Use hybrid service (Local -> then AI)
      const verse = await findScripture(query);
      setCurrentVerse(verse);
      addToHistory(verse);
      fetchInsightsForVerse(verse);

    } catch (error: any) {
      // Show specific error message (e.g., API Key missing vs Not Found)
      alert(error.message || "Could not find verse. Check your internet or use Manual tab.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualPresent = (verse: VerseData) => {
    setCurrentVerse(verse);
    addToHistory(verse);
    fetchInsightsForVerse(verse); // Will likely fail or be generic, but that's fine
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
    
    // Construct absolute URL based on current location
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'live');
    
    try {
      const win = window.open(
        url.toString(), 
        'MormonScripturePresenterLive', 
        `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
      );
      
      if (!win) {
        alert("Pop-up blocked! Please allow pop-ups for this site or use the 'Copy Link' button.");
      }
    } catch (e) {
      alert("Error opening window. Please copy the link manually.");
    }
  };

  // --- Navigation Logic (Forward/Backward) ---
  const handleNavigateVerse = async (direction: 'next' | 'prev') => {
    if (!currentVerse) return;

    // Regex to parse "Book Chapter:Verse"
    // Handles "1 Nephi 3:7", "D&C 6:1", "John 3:16"
    // Captures: 1=Book, 2=Chapter, 3=Verse
    const regex = /^(.+)\s+(\d+):(\d+)$/;
    const match = currentVerse.reference.match(regex);

    if (match) {
      const book = match[1].trim();
      const chapter = parseInt(match[2]);
      const verse = parseInt(match[3]);
      
      const newVerseNum = direction === 'next' ? verse + 1 : verse - 1;
      
      // Basic validation
      if (newVerseNum < 1) return;

      const newQuery = `${book} ${chapter}:${newVerseNum}`;
      
      setIsLoading(true);
      try {
        const verse = await findScripture(newQuery);
        setCurrentVerse(verse);
        addToHistory(verse);
        fetchInsightsForVerse(verse);
      } catch (err) {
        // Specific error handling for navigation
        alert(`Navigation failed: Verse ${newVerseNum} not found in offline library.`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      
      // Don't trigger if we are in Receiver mode (usually Operator controls)
      if (isReceiverMode) return;

      if (e.key === 'ArrowRight') {
        handleNavigateVerse('next');
      } else if (e.key === 'ArrowLeft') {
        handleNavigateVerse('prev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVerse, isReceiverMode]); // Logic depends on currentVerse to calculate next


  // --- RENDER: RECEIVER (LIVE) MODE ---
  if (isReceiverMode) {
    return (
      <div id="presentation-container" className="h-screen w-screen bg-black overflow-hidden relative">
        <SlideDisplay 
          verse={currentVerse}
          settings={settings}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
          isLoading={false} // Loading only shown on operator
          isLive={true}
        />
        {/* Connection Status Indicator (Fades out if content exists) */}
        {!currentVerse && (
          <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black/50 px-3 py-1 rounded text-xs text-gray-500 font-mono">
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{connectionStatus === 'connected' ? 'Connected to Operator' : 'Disconnected'}</span>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER: OPERATOR (PREVIEW) MODE ---
  return (
    <div className="flex h-screen w-screen bg-black overflow-hidden font-sans">
      {/* Sidebar Controls */}
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

      {/* Preview Area */}
      <div className="flex-1 relative h-full bg-gray-900 flex flex-col">
        <div className="flex-none p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center text-gray-400 text-xs uppercase tracking-widest font-bold z-10">
           <span>Live Preview Console</span>
           <span className="flex items-center text-green-500 gap-2">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> 
             System Active
           </span>
        </div>
        
        {/* Presentation Container (Centered & Scaled) */}
        <div 
          className="flex-1 relative bg-gray-950 overflow-hidden" 
          ref={previewContainerRef}
        >
          {/* 
            Absolute Center Positioning Strategy 
            This ensures the 1920x1080 preview is ALWAYS centered, regardless of parent flex behavior.
          */}
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
              isLive={false}
            />
          </div>

          {/* Watermark Overlay */}
          <div className="absolute bottom-4 right-4 text-xs font-bold text-white/10 uppercase pointer-events-none select-none">
             1920x1080 Scaled Preview
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
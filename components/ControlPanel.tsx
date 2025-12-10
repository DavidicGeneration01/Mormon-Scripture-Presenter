import React, { useState } from 'react';
import { Search, BookOpen, Settings, Info, History, MonitorPlay, Link as LinkIcon, PenTool, ChevronLeft, ChevronRight } from 'lucide-react';
import { VerseData, AIInsight, PresentationSettings, ThemeMode, HistoryItem } from '../types';

interface ControlPanelProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  currentVerse: VerseData | null;
  insight: AIInsight | null;
  settings: PresentationSettings;
  updateSettings: (newSettings: Partial<PresentationSettings>) => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onLaunchLive: () => void;
  onManualPresent: (verse: VerseData) => void;
  onNext: () => void;
  onPrev: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onSearch,
  isLoading,
  currentVerse,
  insight,
  settings,
  updateSettings,
  history,
  onSelectHistory,
  onLaunchLive,
  onManualPresent,
  onNext,
  onPrev
}) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'settings' | 'insight' | 'manual'>('search');
  
  // Manual Entry State
  const [manualRef, setManualRef] = useState('');
  const [manualText, setManualText] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualRef.trim() && manualText.trim()) {
        const manualVerse: VerseData = {
            reference: manualRef,
            text: manualText,
            book: "Manual",
            chapter: 0,
            verse: 0,
            version: "Custom"
        };
        onManualPresent(manualVerse);
    }
  };

  const handleCopyLink = () => {
     const url = new URL(window.location.href);
     url.searchParams.set('mode', 'live');
     navigator.clipboard.writeText(url.toString());
     alert("Live Link copied to clipboard! Paste it in a new window/tab.");
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 border-r border-gray-800 text-gray-300 w-full shadow-2xl z-30">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 text-sky-500">
            <BookOpen className="w-6 h-6" />
            <h1 className="text-xl font-display font-bold tracking-wider">Mormon Scripture Presenter</h1>
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-widest">Operator</div>
        </div>
        
        <div className="flex space-x-2">
            <button 
            onClick={onLaunchLive}
            className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-navy-600 to-navy-500 hover:from-navy-500 hover:to-navy-400 text-white font-bold py-3 px-2 rounded-lg transition-all shadow-lg hover:shadow-navy-500/20 active:scale-95 border border-navy-400/20"
            title="Open Live Window"
            >
            <MonitorPlay size={18} />
            <span className="text-sm">Launch Live</span>
            </button>
            <button
                onClick={handleCopyLink}
                className="flex-none px-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors border border-gray-700"
                title="Copy Live Link (Use if popup blocked)"
            >
                <LinkIcon size={18} />
            </button>
        </div>
        <p className="text-[10px] text-gray-500 text-center mt-2">
          Opens a separate window for projector/HDMI
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 text-sm overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-3 px-2 flex justify-center items-center hover:bg-gray-800 transition-colors ${activeTab === 'search' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-gray-500'}`}
        >
          <Search size={16} className="mr-1" /> Search
        </button>
        <button 
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-3 px-2 flex justify-center items-center hover:bg-gray-800 transition-colors ${activeTab === 'manual' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-gray-500'}`}
        >
          <PenTool size={16} className="mr-1" /> Manual
        </button>
        <button 
          onClick={() => setActiveTab('insight')}
          className={`flex-1 py-3 px-2 flex justify-center items-center hover:bg-gray-800 transition-colors ${activeTab === 'insight' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-gray-500'}`}
        >
          <Info size={16} className="mr-1" /> Insight
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-3 px-2 flex justify-center items-center hover:bg-gray-800 transition-colors ${activeTab === 'settings' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-gray-500'}`}
        >
          <Settings size={16} className="mr-1" /> Style
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
        
        {/* TAB: SEARCH */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="space-y-3">
                <form onSubmit={handleSearchSubmit} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ex: John 3:16, 1 Nephi 3:7..."
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder-gray-600"
                />
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="absolute right-2 top-2 p-1.5 bg-navy-600 hover:bg-navy-500 text-white rounded-md transition-colors disabled:opacity-50"
                >
                    <Search size={18} />
                </button>
                </form>
                <p className="text-xs text-gray-500 ml-1">Supports Bible, Book of Mormon, D&C, and PGP</p>

                {/* Verse Navigation Controls */}
                {currentVerse && (
                    <div className="flex items-center space-x-2 mt-2 bg-gray-900 p-2 rounded-lg border border-gray-800">
                        <button 
                            onClick={onPrev}
                            className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                            title="Previous Verse (Arrow Left)"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex-1 text-center">
                            <span className="text-xs font-bold text-sky-500 uppercase tracking-wider">Current Verse</span>
                            <div className="text-sm font-serif text-white truncate">{currentVerse.reference}</div>
                        </div>
                        <button 
                            onClick={onNext}
                            className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                            title="Next Verse (Arrow Right)"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            {history.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  <History size={12} />
                  <span>Recent Verses</span>
                </div>
                <div className="space-y-2">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSelectHistory(item)}
                      className="w-full text-left p-3 rounded bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 transition-all group"
                    >
                      <div className="font-bold text-sky-100 group-hover:text-sky-400 transition-colors">
                        {item.verse.reference}
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-1 font-serif italic">
                        "{item.verse.text}"
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: MANUAL */}
        {activeTab === 'manual' && (
            <div className="space-y-6 animate-fadeIn">
                <div className="bg-blue-900/20 border border-blue-900/50 p-3 rounded text-xs text-blue-200">
                    Use this mode when offline or for custom text.
                </div>
                <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Reference / Title</label>
                        <input 
                            type="text"
                            value={manualRef}
                            onChange={(e) => setManualRef(e.target.value)}
                            placeholder="e.g. Alma 5:14"
                            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Scripture Text</label>
                        <textarea 
                            value={manualText}
                            onChange={(e) => setManualText(e.target.value)}
                            placeholder="And now behold, I ask of you, my brethren of the church, have ye spiritually been born of God?..."
                            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 h-40 focus:outline-none focus:border-sky-500 font-serif leading-relaxed"
                            required
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-navy-600 hover:bg-navy-500 text-white font-bold py-3 rounded-lg shadow-lg transition-all border border-navy-400/20"
                    >
                        Present Now
                    </button>
                </form>
            </div>
        )}

        {/* TAB: INSIGHTS */}
        {activeTab === 'insight' && (
          <div className="space-y-6 animate-fadeIn">
            {!currentVerse ? (
              <div className="text-center text-gray-600 py-10">
                <Info className="mx-auto h-10 w-10 mb-2 opacity-20" />
                <p>Select a verse to see insights.</p>
              </div>
            ) : !insight ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500"></div>
                 <p className="text-sm text-gray-500">Asking Gemini for insights...</p>
                 <p className="text-xs text-gray-600">(Requires Internet)</p>
              </div>
            ) : (
              <div className="space-y-6">
                 <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                    <h3 className="text-sky-500 text-xs font-bold uppercase tracking-widest mb-2">Context</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">{insight.context}</p>
                 </div>
                 <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                    <h3 className="text-sky-500 text-xs font-bold uppercase tracking-widest mb-2">Theological Meaning</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">{insight.theology}</p>
                 </div>
                 <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                    <h3 className="text-sky-500 text-xs font-bold uppercase tracking-widest mb-2">Application</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">{insight.application}</p>
                 </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fadeIn">
             
             {/* Theme Selector */}
             <div>
               <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Theme</label>
               <div className="grid grid-cols-2 gap-2">
                 {(Object.values(ThemeMode) as ThemeMode[]).map((mode) => (
                   <button
                    key={mode}
                    onClick={() => updateSettings({ theme: mode })}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      settings.theme === mode 
                      ? 'border-sky-500 bg-gray-800 text-sky-400' 
                      : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-600'
                    }`}
                   >
                     {mode}
                   </button>
                 ))}
               </div>
             </div>

             {/* Alignment */}
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Alignment</label>
                <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
                  {['left', 'center', 'right'].map((align) => (
                    <button
                      key={align}
                      onClick={() => updateSettings({ alignment: align as any })}
                      className={`flex-1 py-2 rounded text-xs uppercase font-bold transition-colors ${
                        settings.alignment === align 
                        ? 'bg-gray-800 text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
             </div>

             {/* Toggles */}
             <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-400">Show Reference</span>
                <button 
                  onClick={() => updateSettings({ showReference: !settings.showReference })}
                  className={`w-11 h-6 flex items-center rounded-full transition-colors ${settings.showReference ? 'bg-sky-600' : 'bg-gray-800'}`}
                >
                  <span className={`w-4 h-4 bg-white rounded-full transform transition-transform ml-1 ${settings.showReference ? 'translate-x-5' : ''}`} />
                </button>
             </div>
             
             <div className="bg-gray-900 p-3 rounded text-xs text-gray-500 border border-gray-800 mt-4">
                Note: Font size is automatically adjusted to fit the slide perfectly.
             </div>

          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-900 border-t border-gray-800 text-xs text-gray-600 text-center">
        Powered by Gemini 2.5 Flash
      </div>
    </div>
  );
};

export default ControlPanel;
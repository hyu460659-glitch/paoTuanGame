import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'profile' | 'game' | 'script';
  setActiveTab: (tab: 'profile' | 'game' | 'script') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen bg-[#1a1510] text-[#d4c5a6] font-serif overflow-hidden flex flex-col">
      {/* Header */}
      <header className="border-b-4 border-[#4a3b2a] bg-[#2c241b] p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-[#e6b32e] drop-shadow-md">
            TRPG 编年史
          </h1>
          <nav className="flex space-x-2 md:space-x-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-t-lg transition-all duration-300 font-bold ${
                activeTab === 'profile'
                  ? 'bg-[#f4e4bc] text-[#2c241b] translate-y-1'
                  : 'bg-[#4a3b2a] hover:bg-[#5c4a35] text-[#d4c5a6]'
              }`}
            >
              个人 & 装备
            </button>
            <button
              onClick={() => setActiveTab('game')}
              className={`px-4 py-2 rounded-t-lg transition-all duration-300 font-bold ${
                activeTab === 'game'
                  ? 'bg-[#f4e4bc] text-[#2c241b] translate-y-1'
                  : 'bg-[#4a3b2a] hover:bg-[#5c4a35] text-[#d4c5a6]'
              }`}
            >
              冒险旅途
            </button>
            <button
              onClick={() => setActiveTab('script')}
              className={`px-4 py-2 rounded-t-lg transition-all duration-300 font-bold ${
                activeTab === 'script'
                  ? 'bg-[#f4e4bc] text-[#2c241b] translate-y-1'
                  : 'bg-[#4a3b2a] hover:bg-[#5c4a35] text-[#d4c5a6]'
              }`}
            >
              剧本之书
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area - Styled like parchment */}
      <main className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-20 pointer-events-none"></div>
        <div className="h-full max-w-6xl mx-auto p-4 md:p-6 overflow-y-auto custom-scrollbar">
           {children}
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2c241b; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #5c4a35; 
          border: 1px solid #e6b32e;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #e6b32e; 
        }
      `}</style>
    </div>
  );
};

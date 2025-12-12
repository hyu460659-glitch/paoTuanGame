import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Character, CheckRequest } from '../types';
import { Send, Dices, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface GameInterfaceProps {
  chatHistory: ChatMessage[];
  character: Character;
  onSendMessage: (message: string) => void;
  onDiceRoll: (dice: number) => void;
  onResolveCheck: (roll: number, modifier: number, attribute: string, dc: number) => void;
  pendingCheck: CheckRequest | null;
  isLoading: boolean;
}

export const GameInterface: React.FC<GameInterfaceProps> = ({ 
  chatHistory, 
  character,
  onSendMessage, 
  onDiceRoll,
  onResolveCheck,
  pendingCheck,
  isLoading 
}) => {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, pendingCheck]);

  const handleSend = () => {
    if (!input.trim() || isLoading || pendingCheck) return;
    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCheckRoll = () => {
    if (!pendingCheck) return;
    const modifier = Math.floor((character.stats[pendingCheck.attribute] - 10) / 2);
    const d20 = Math.floor(Math.random() * 20) + 1;
    onResolveCheck(d20, modifier, pendingCheck.attribute, pendingCheck.difficulty);
  };

  // Map attribute keys to Chinese labels
  const attrMap: Record<string, string> = {
    strength: '力量',
    dexterity: '敏捷',
    constitution: '体质',
    intelligence: '智力',
    wisdom: '感知',
    charisma: '魅力'
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-180px)] gap-4">
      
      {/* Chat Area */}
      <div className="flex-1 bg-[#f4e4bc] rounded-lg border-2 border-[#4a3b2a] shadow-inner overflow-hidden flex flex-col relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-b from-[#c9b282] to-transparent pointer-events-none"></div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {chatHistory.length === 0 && (
            <div className="text-center text-[#2c241b] opacity-50 mt-10 italic">
              冒险尚未开始。请在下方输入文字或掷骰子开始旅程...
            </div>
          )}
          
          {chatHistory.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : msg.sender === 'system' ? 'items-center' : 'items-start'}`}
            >
              {/* Sender Label */}
              <span className="text-xs text-[#5c4a35] mb-1 font-bold px-1">
                {msg.sender === 'user' ? character.name : msg.sender === 'system' ? '系统' : '主持人 (GM)'}
              </span>

              {/* Message Bubble */}
              <div 
                className={`max-w-[85%] md:max-w-[70%] p-3 rounded-lg text-sm md:text-base leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-[#2c241b] text-[#f4e4bc] rounded-tr-none' 
                    : msg.sender === 'system'
                    ? 'bg-[#d9c08c] text-[#2c241b] text-xs font-mono border border-[#4a3b2a]'
                    : 'bg-[#e8d5a8] text-[#2c241b] border border-[#c9b282] rounded-tl-none'
                }`}
              >
                {msg.sender === 'ai' ? (
                  <ReactMarkdown 
                    components={{
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-[#4a3b2a]" {...props} />,
                      em: ({node, ...props}) => <em className="italic text-[#5c4a35]" {...props} />
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {/* Pending Check UI */}
          {pendingCheck && !isLoading && (
             <div className="flex flex-col items-center animate-fade-in-up my-4 p-4 bg-[#2c241b] border-2 border-[#e6b32e] rounded-lg shadow-xl text-[#f4e4bc] w-full md:w-2/3 mx-auto relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#e6b32e] to-transparent"></div>
                <div className="flex items-center gap-2 mb-2 text-[#e6b32e] font-bold text-lg">
                    <AlertCircle size={24} />
                    <span>命运检定请求</span>
                </div>
                <p className="text-center mb-4 text-sm opacity-90">{pendingCheck.reason}</p>
                
                <div className="flex flex-col items-center gap-2 bg-[#1a1510] p-4 rounded w-full border border-[#4a3b2a]">
                    <div className="text-xs uppercase tracking-widest opacity-60">Check Type</div>
                    <div className="text-2xl font-bold flex items-center gap-2">
                        {attrMap[pendingCheck.attribute]} <span className="text-sm font-normal text-[#d9c08c]">vs</span> DC {pendingCheck.difficulty}
                    </div>
                    <div className="text-xs text-[#d9c08c]">
                       修正值: {Math.floor((character.stats[pendingCheck.attribute] - 10) / 2) >= 0 ? '+' : ''}{Math.floor((character.stats[pendingCheck.attribute] - 10) / 2)}
                    </div>
                </div>

                <button 
                    onClick={handleCheckRoll}
                    className="mt-4 bg-[#e6b32e] hover:bg-[#ffc947] text-[#2c241b] font-bold py-2 px-8 rounded-full shadow-lg transform transition hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                    <Dices size={20} />
                    <span>投掷 D20</span>
                </button>
             </div>
          )}
          
          {isLoading && (
            <div className="flex items-start">
               <span className="text-xs text-[#5c4a35] mb-1 font-bold px-1">主持人 (GM)</span>
               <div className="bg-[#e8d5a8] p-3 rounded-lg rounded-tl-none text-[#2c241b] border border-[#c9b282] flex gap-2 items-center">
                  <div className="w-2 h-2 bg-[#4a3b2a] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#4a3b2a] rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-[#4a3b2a] rounded-full animate-bounce delay-200"></div>
                  <span className="text-xs italic opacity-70">思考命运中...</span>
               </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Control Area */}
      <div className={`bg-[#2c241b] p-3 rounded-lg border-2 border-[#e6b32e] shadow-lg flex flex-col md:flex-row gap-3 items-center transition-opacity duration-300 ${pendingCheck ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Dice Controls */}
        <div className="flex gap-2 shrink-0 border-b md:border-b-0 md:border-r border-[#4a3b2a] pb-2 md:pb-0 md:pr-3">
            <button 
                onClick={() => onDiceRoll(20)}
                disabled={isLoading || !!pendingCheck}
                className="flex flex-col items-center justify-center w-12 h-12 bg-[#4a3b2a] text-[#e6b32e] rounded hover:bg-[#5c4a35] transition-colors border border-[#e6b32e] disabled:opacity-50 disabled:cursor-not-allowed"
                title="Roll D20"
            >
                <Dices size={20} />
                <span className="text-[10px] font-bold">D20</span>
            </button>
            <button 
                onClick={() => onDiceRoll(6)}
                disabled={isLoading || !!pendingCheck}
                className="flex flex-col items-center justify-center w-12 h-12 bg-[#4a3b2a] text-[#f4e4bc] rounded hover:bg-[#5c4a35] transition-colors border border-[#f4e4bc] disabled:opacity-50 disabled:cursor-not-allowed"
                 title="Roll D6"
            >
                <Dices size={20} />
                <span className="text-[10px] font-bold">D6</span>
            </button>
        </div>

        {/* Text Input */}
        <div className="flex-1 w-full flex gap-2">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading || !!pendingCheck}
                placeholder={pendingCheck ? "请先完成检定..." : "描述你的行动或对话..."}
                className="w-full bg-[#f4e4bc] text-[#2c241b] rounded px-3 py-2 border border-[#4a3b2a] focus:outline-none focus:ring-2 focus:ring-[#e6b32e] resize-none h-12 disabled:bg-[#d9c08c] disabled:text-opacity-50"
            />
            <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim() || !!pendingCheck}
                className="bg-[#e6b32e] text-[#2c241b] w-14 rounded hover:bg-[#ffc947] transition-colors flex items-center justify-center font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Send size={24} />
            </button>
        </div>
      </div>
    </div>
  );
};

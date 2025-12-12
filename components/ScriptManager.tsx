import React, { useState } from 'react';
import { GameSettings } from '../types';
import { Save, Upload } from 'lucide-react';
import mammoth from 'mammoth';

interface ScriptManagerProps {
  settings: GameSettings;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const ScriptManager: React.FC<ScriptManagerProps> = ({ settings, updateSettings }) => {
  const [localWorld, setLocalWorld] = useState(settings.worldSetting);
  const [localScript, setLocalScript] = useState(settings.scriptContent);

  const handleSave = () => {
    updateSettings({ worldSetting: localWorld, scriptContent: localScript });
    alert('世界设定与剧本已保存，AI主持人已更新记忆。');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'world' | 'script') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.docx')) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        try {
          // Use mammoth to extract raw text from docx
          const result = await mammoth.extractRawText({ arrayBuffer });
          const text = result.value;
          if (type === 'world') setLocalWorld(text);
          else setLocalScript(text);
        } catch (error) {
          console.error("Error parsing DOCX:", error);
          alert("无法读取Word文档，请确保文件格式正确 (.docx)。");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Fallback for .txt or other text-based files
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (type === 'world') setLocalWorld(text);
        else setLocalScript(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
      {/* World Settings */}
      <div className="flex flex-col h-full bg-[#f4e4bc] p-4 rounded-lg border-2 border-[#4a3b2a] shadow-lg">
        <div className="flex justify-between items-center mb-4 border-b border-[#4a3b2a] pb-2">
            <h3 className="text-xl font-bold text-[#2c241b]">世界观设定</h3>
            <label className="cursor-pointer flex items-center gap-2 bg-[#d9c08c] px-3 py-1 rounded border border-[#4a3b2a] text-sm text-[#2c241b] hover:bg-[#c9b282] transition-colors">
                <Upload size={14} />
                <span>导入 txt / docx</span>
                <input type="file" accept=".txt, .docx" className="hidden" onChange={(e) => handleFileUpload(e, 'world')} />
            </label>
        </div>
        <textarea
          className="flex-1 w-full bg-[#e8d5a8] border border-[#c9b282] p-4 rounded text-[#2c241b] focus:outline-none focus:border-[#4a3b2a] resize-none font-serif leading-relaxed custom-textarea"
          value={localWorld}
          onChange={(e) => setLocalWorld(e.target.value)}
          placeholder="在此输入世界观背景、地理、宗教、政治势力等设定..."
        />
      </div>

      {/* Script/Scenario */}
      <div className="flex flex-col h-full bg-[#f4e4bc] p-4 rounded-lg border-2 border-[#4a3b2a] shadow-lg">
        <div className="flex justify-between items-center mb-4 border-b border-[#4a3b2a] pb-2">
            <h3 className="text-xl font-bold text-[#2c241b]">剧本/模组大纲 (支持10w+字)</h3>
             <label className="cursor-pointer flex items-center gap-2 bg-[#d9c08c] px-3 py-1 rounded border border-[#4a3b2a] text-sm text-[#2c241b] hover:bg-[#c9b282] transition-colors">
                <Upload size={14} />
                <span>导入 txt / docx</span>
                <input type="file" accept=".txt, .docx" className="hidden" onChange={(e) => handleFileUpload(e, 'script')} />
            </label>
        </div>
        <textarea
          className="flex-1 w-full bg-[#e8d5a8] border border-[#c9b282] p-4 rounded text-[#2c241b] focus:outline-none focus:border-[#4a3b2a] resize-none font-serif leading-relaxed custom-textarea"
          value={localScript}
          onChange={(e) => setLocalScript(e.target.value)}
          placeholder="在此输入剧情大纲、NPC对话、事件触发条件等..."
        />
      </div>

      <div className="md:col-span-2 flex justify-center mt-4">
        <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#2c241b] text-[#e6b32e] px-8 py-3 rounded text-lg font-bold border-2 border-[#e6b32e] shadow-lg hover:bg-[#4a3b2a] transition-all transform hover:-translate-y-1"
        >
            <Save /> 保存设定
        </button>
      </div>

      <style>{`
        .custom-textarea::-webkit-scrollbar {
          width: 8px;
        }
        .custom-textarea::-webkit-scrollbar-track {
          background: #e8d5a8;
        }
        .custom-textarea::-webkit-scrollbar-thumb {
          background: #4a3b2a;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};
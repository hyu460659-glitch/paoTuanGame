import React, { useState, useEffect } from 'react';
import { Character, Item, Skill, Equipment } from '../types';
import { Shield, Sword, User, Zap, Heart, Brain, Sparkles, Scroll, Edit2, Check, X, Eye, Wind, Activity, BookOpen, Shirt, Footprints, Crown, Hand, Grip } from 'lucide-react';

interface CharacterSheetProps {
  character: Character;
  onUpdateCharacter: (updates: Partial<Character>) => void;
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({ character, onUpdateCharacter }) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: character.name,
    class: character.class,
    gender: character.gender
  });

  useEffect(() => {
    setEditForm({
      name: character.name,
      class: character.class,
      gender: character.gender
    });
  }, [character]);

  const handleSave = () => {
    onUpdateCharacter({
      name: editForm.name,
      class: editForm.class,
      gender: editForm.gender
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: character.name,
      class: character.class,
      gender: character.gender
    });
    setIsEditing(false);
  };

  const handleEquip = (item: Item) => {
    if (!item.equipSlot) return;

    const slot = item.equipSlot;
    const currentEquipped = character.equipment[slot];
    
    let newInventory = character.inventory.filter(i => i.id !== item.id);
    // If something was equipped, put it back in inventory
    if (currentEquipped) {
        newInventory.push(currentEquipped);
    }

    onUpdateCharacter({
        inventory: newInventory,
        equipment: {
            ...character.equipment,
            [slot]: item
        }
    });
    setSelectedItem(null); // Close modal
  };

  const handleUnequip = (slot: keyof Equipment) => {
      const item = character.equipment[slot];
      if (!item) return;

      onUpdateCharacter({
          inventory: [...character.inventory, item],
          equipment: {
              ...character.equipment,
              [slot]: null
          }
      });
  };

  const StatBar = ({ label, current, max, color }: { label: string, current: number, max: number, color: string }) => (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="font-bold text-[#2c241b]">{label}</span>
        <span className="font-mono text-[#2c241b]">{current} / {max}</span>
      </div>
      <div className="w-full bg-[#2c241b] h-4 rounded-full border border-[#4a3b2a] p-[1px]">
        <div 
          className={`h-full rounded-full ${color} transition-all duration-500`} 
          style={{ width: `${Math.max(0, Math.min(100, (current / max) * 100))}%` }}
        ></div>
      </div>
    </div>
  );

  const EquipmentSlot = ({ slotName, label, icon: Icon }: { slotName: keyof Equipment, label: string, icon: any }) => {
      const equippedItem = character.equipment[slotName];
      return (
          <div 
            className={`relative p-2 rounded border-2 flex flex-col items-center justify-center h-24 w-24 transition-all ${
                equippedItem 
                ? 'bg-[#e8d5a8] border-[#c9b282] cursor-pointer hover:bg-[#d9c08c]' 
                : 'bg-[#4a3b2a]/10 border-[#4a3b2a]/30 border-dashed'
            }`}
            onClick={() => equippedItem && handleUnequip(slotName)}
            title={equippedItem ? `点击卸下: ${equippedItem.name}` : label}
          >
              {equippedItem ? (
                  <>
                    <div className="mb-1 text-[#2c241b]"><Icon size={24}/></div>
                    <span className="text-[10px] text-center font-bold leading-tight line-clamp-2">{equippedItem.name}</span>
                  </>
              ) : (
                  <>
                    <div className="mb-1 text-[#4a3b2a]/40"><Icon size={24}/></div>
                    <span className="text-[10px] text-[#4a3b2a]/50 font-bold">{label}</span>
                  </>
              )}
          </div>
      );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-[#2c241b]">
      
      {/* Left Column: Stats & Attributes */}
      <div className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-[#f4e4bc] p-6 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] border-2 border-[#4a3b2a] relative">
            <div className="absolute -top-3 -left-3 bg-[#e6b32e] p-2 rounded-full border-2 border-[#2c241b]">
                <User size={24} className="text-[#2c241b]" />
            </div>
            
            <div className="flex justify-between items-center mb-4 pl-8 border-b border-[#4a3b2a] pb-2">
                <h2 className="text-2xl font-bold">冒险者档案</h2>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-[#5c4a35] hover:text-[#2c241b] transition-colors p-1"
                    title="编辑资料"
                  >
                    <Edit2 size={18} />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="text-green-800 hover:text-green-600 bg-[#d9c08c] p-1 rounded border border-[#4a3b2a]"><Check size={18} /></button>
                    <button onClick={handleCancel} className="text-red-800 hover:text-red-600 bg-[#d9c08c] p-1 rounded border border-[#4a3b2a]"><X size={18} /></button>
                  </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <span className="block text-sm font-semibold opacity-70">姓名</span>
                    {isEditing ? (
                        <input 
                          className="w-full bg-[#e8d5a8] border border-[#c9b282] rounded px-2 py-1 text-[#2c241b] font-bold focus:outline-none focus:border-[#4a3b2a]"
                          value={editForm.name}
                          onChange={e => setEditForm({...editForm, name: e.target.value})}
                        />
                    ) : (
                        <span className="text-xl font-bold">{character.name}</span>
                    )}
                </div>
                <div>
                    <span className="block text-sm font-semibold opacity-70">职业 (自定义)</span>
                    {isEditing ? (
                        <input 
                          className="w-full bg-[#e8d5a8] border border-[#c9b282] rounded px-2 py-1 text-[#2c241b] font-bold focus:outline-none focus:border-[#4a3b2a]"
                          value={editForm.class}
                          onChange={e => setEditForm({...editForm, class: e.target.value})}
                          placeholder="例如: 游侠"
                        />
                    ) : (
                        <span className="text-xl font-bold">{character.class} <span className="text-sm font-normal">(Lv.{character.level})</span></span>
                    )}
                </div>
                <div>
                    <span className="block text-sm font-semibold opacity-70">性别</span>
                    {isEditing ? (
                        <select
                          className="w-full bg-[#e8d5a8] border border-[#c9b282] rounded px-2 py-1 text-[#2c241b] focus:outline-none focus:border-[#4a3b2a]"
                          value={editForm.gender}
                          onChange={e => setEditForm({...editForm, gender: e.target.value})}
                        >
                          <option value="男">男</option>
                          <option value="女">女</option>
                          <option value="未知">未知</option>
                        </select>
                    ) : (
                        <span className="text-lg">{character.gender}</span>
                    )}
                </div>
            </div>
        </div>

        {/* Vitals */}
        <div className="bg-[#f4e4bc] p-6 rounded-lg shadow-lg border-2 border-[#4a3b2a]">
             <h3 className="text-xl font-bold mb-4 border-b border-[#4a3b2a] pb-2">生存状态</h3>
             <div className="flex items-center gap-2 mb-2">
                 <Heart className="text-red-700" size={20} />
                 <span className="text-sm">体力 (HP)</span>
             </div>
             <StatBar 
                label="" 
                current={character.currentStats.hp} 
                max={character.currentStats.maxHp} 
                color="bg-red-700" 
             />
             
             <div className="flex items-center gap-2 mb-2 mt-2">
                 <Brain className="text-blue-700" size={20} />
                 <span className="text-sm">精神 (SP)</span>
             </div>
             <StatBar 
                label="" 
                current={character.currentStats.sp} 
                max={character.currentStats.maxSp} 
                color="bg-blue-700" 
             />
        </div>

        {/* Equipment Slots (Paper Doll) */}
        <div className="bg-[#f4e4bc] p-6 rounded-lg shadow-lg border-2 border-[#4a3b2a]">
            <h3 className="text-xl font-bold mb-4 border-b border-[#4a3b2a] pb-2">当前装备</h3>
            <div className="flex flex-col items-center gap-4">
                {/* Top Row: Head */}
                <EquipmentSlot slotName="head" label="头部" icon={Crown} />
                
                {/* Middle Row: MainHand, Chest, OffHand */}
                <div className="flex gap-4">
                    <EquipmentSlot slotName="mainHand" label="主手武器" icon={Sword} />
                    <EquipmentSlot slotName="chest" label="躯干/护甲" icon={Shirt} />
                    <EquipmentSlot slotName="offHand" label="副手/盾牌" icon={Shield} />
                </div>

                {/* Hands and Accessory Row */}
                <div className="flex gap-4">
                     <EquipmentSlot slotName="hands" label="手甲/护臂" icon={Hand} />
                     <EquipmentSlot slotName="accessory" label="饰品" icon={Sparkles} />
                </div>

                {/* Bottom Row: Legs, Feet */}
                <div className="flex gap-4">
                    <EquipmentSlot slotName="legs" label="护腿/裤子" icon={Grip} />
                    <EquipmentSlot slotName="feet" label="靴子" icon={Footprints} />
                </div>
            </div>
            <p className="text-center text-xs opacity-60 mt-4">点击已装备物品可卸下</p>
        </div>

        {/* Core Attributes */}
        <div className="bg-[#f4e4bc] p-6 rounded-lg shadow-lg border-2 border-[#4a3b2a]">
             <h3 className="text-xl font-bold mb-4 border-b border-[#4a3b2a] pb-2">核心属性 (六维)</h3>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                 <div className="bg-[#e8d5a8] p-2 rounded border border-[#c9b282] flex flex-col items-center">
                     <span className="text-sm font-bold flex items-center gap-1 mb-1"><Sword size={14}/> 力量</span>
                     <span className="text-xl font-mono font-bold">{character.stats.strength}</span>
                 </div>
                 <div className="bg-[#e8d5a8] p-2 rounded border border-[#c9b282] flex flex-col items-center">
                     <span className="text-sm font-bold flex items-center gap-1 mb-1"><Wind size={14}/> 敏捷</span>
                     <span className="text-xl font-mono font-bold">{character.stats.dexterity}</span>
                 </div>
                 <div className="bg-[#e8d5a8] p-2 rounded border border-[#c9b282] flex flex-col items-center">
                     <span className="text-sm font-bold flex items-center gap-1 mb-1"><Shield size={14}/> 体质</span>
                     <span className="text-xl font-mono font-bold">{character.stats.constitution}</span>
                 </div>
                 <div className="bg-[#e8d5a8] p-2 rounded border border-[#c9b282] flex flex-col items-center">
                     <span className="text-sm font-bold flex items-center gap-1 mb-1"><Scroll size={14}/> 智力</span>
                     <span className="text-xl font-mono font-bold">{character.stats.intelligence}</span>
                 </div>
                 <div className="bg-[#e8d5a8] p-2 rounded border border-[#c9b282] flex flex-col items-center">
                     <span className="text-sm font-bold flex items-center gap-1 mb-1"><Eye size={14}/> 感知</span>
                     <span className="text-xl font-mono font-bold">{character.stats.wisdom}</span>
                 </div>
                 <div className="bg-[#e8d5a8] p-2 rounded border border-[#c9b282] flex flex-col items-center">
                     <span className="text-sm font-bold flex items-center gap-1 mb-1"><Sparkles size={14}/> 魅力</span>
                     <span className="text-xl font-mono font-bold">{character.stats.charisma}</span>
                 </div>
             </div>
        </div>
      </div>

      {/* Right Column: Inventory & Skills */}
      <div className="space-y-6">
        
        {/* Skills */}
        <div className="bg-[#f4e4bc] p-6 rounded-lg shadow-lg border-2 border-[#4a3b2a]">
            <h3 className="text-xl font-bold mb-4 border-b border-[#4a3b2a] pb-2">习得技能 / 专长</h3>
            {character.skills.length === 0 ? (
                <p className="text-sm italic opacity-70">尚未习得任何特殊技能。</p>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {character.skills.map((skill, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => setSelectedSkill(skill)}
                            className="bg-[#2c241b] text-[#f4e4bc] px-3 py-1 rounded-full text-sm font-semibold border border-[#e6b32e] hover:bg-[#e6b32e] hover:text-[#2c241b] transition-colors flex items-center gap-1"
                        >
                            {skill.name}
                        </button>
                    ))}
                </div>
            )}
            <p className="mt-4 text-xs opacity-60 text-right">点击技能查看详情...</p>
        </div>

        {/* Equipment/Inventory List */}
        <div className="bg-[#f4e4bc] p-6 rounded-lg shadow-lg border-2 border-[#4a3b2a] flex-1">
            <h3 className="text-xl font-bold mb-4 border-b border-[#4a3b2a] pb-2">行囊 (点击查看详情/装备)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {character.inventory.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="text-left bg-[#e8d5a8] p-3 rounded border border-[#c9b282] hover:bg-[#d9c08c] hover:border-[#a68b5b] transition-colors flex items-center gap-3 relative"
                    >
                         {item.equipSlot && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-green-600 rounded-full" title="可装备"></div>
                        )}
                        <div className="p-2 bg-[#c9b282] rounded-full">
                            {item.type === 'weapon' && <Sword size={16} />}
                            {item.type === 'armor' && <Shield size={16} />}
                            {item.type === 'consumable' && <Heart size={16} />}
                            {item.type === 'misc' && <Sparkles size={16} />}
                        </div>
                        <div>
                            <span className="font-bold block text-sm">{item.name}</span>
                            <span className="text-xs opacity-70 uppercase">{item.type}</span>
                        </div>
                    </button>
                ))}
                {character.inventory.length === 0 && (
                    <p className="col-span-2 text-center italic opacity-60 py-4">行囊空空如也...</p>
                )}
            </div>
        </div>
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
            <div className="bg-[#f4e4bc] max-w-md w-full p-6 rounded-lg border-4 border-[#4a3b2a] shadow-2xl relative animate-fade-in-up">
                <button 
                    onClick={() => setSelectedItem(null)}
                    className="absolute top-2 right-2 text-[#2c241b] hover:text-red-700 font-bold text-xl"
                >
                    ×
                </button>
                <h3 className="text-2xl font-bold mb-2 text-[#2c241b]">{selectedItem.name}</h3>
                <div className="flex gap-2 mb-4">
                    <div className="inline-block px-2 py-1 bg-[#4a3b2a] text-[#f4e4bc] text-xs rounded uppercase">
                        {selectedItem.type}
                    </div>
                    {selectedItem.equipSlot && (
                        <div className="inline-block px-2 py-1 bg-green-700 text-[#f4e4bc] text-xs rounded uppercase">
                            部位: {selectedItem.equipSlot}
                        </div>
                    )}
                </div>
                
                <p className="text-[#2c241b] mb-4 min-h-[60px] whitespace-pre-wrap">{selectedItem.description}</p>
                
                {selectedItem.effect && (
                    <div className="bg-[#e8d5a8] p-3 rounded border border-[#c9b282] mb-4">
                        <span className="font-bold text-sm block mb-1">效果:</span>
                        <span className="text-sm font-mono text-green-900">{selectedItem.effect}</span>
                    </div>
                )}

                {selectedItem.equipSlot && (
                    <button 
                        onClick={() => handleEquip(selectedItem)}
                        className="w-full bg-[#e6b32e] text-[#2c241b] py-2 rounded font-bold border border-[#4a3b2a] hover:bg-[#d4a017] transition-colors flex items-center justify-center gap-2"
                    >
                        <Shield size={18} />
                        装备此物品
                    </button>
                )}
            </div>
        </div>
      )}

      {/* Skill Details Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
            <div className="bg-[#f4e4bc] max-w-md w-full p-6 rounded-lg border-4 border-[#4a3b2a] shadow-2xl relative">
                <button 
                    onClick={() => setSelectedSkill(null)}
                    className="absolute top-2 right-2 text-[#2c241b] hover:text-red-700 font-bold text-xl"
                >
                    ×
                </button>
                <div className="flex items-center gap-2 mb-4">
                    <div className="bg-[#e6b32e] p-2 rounded-full text-[#2c241b] border border-[#4a3b2a]">
                        <BookOpen size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-[#2c241b]">{selectedSkill.name}</h3>
                </div>
                
                <div className="bg-[#e8d5a8] p-4 rounded border border-[#c9b282] min-h-[100px]">
                    <p className="text-[#2c241b] leading-relaxed whitespace-pre-wrap">{selectedSkill.description}</p>
                </div>
                
                <div className="mt-4 text-center">
                    <button 
                        onClick={() => setSelectedSkill(null)}
                        className="bg-[#4a3b2a] text-[#f4e4bc] px-6 py-2 rounded hover:bg-[#5c4a35] font-bold"
                    >
                        关闭
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};
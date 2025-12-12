import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { CharacterSheet } from './components/CharacterSheet';
import { ScriptManager } from './components/ScriptManager';
import { GameInterface } from './components/GameInterface';
import { Character, GameSettings, ChatMessage, AIResponseSchema, CheckRequest } from './types';
import { generateGMResponse } from './services/geminiService';
import { v4 as uuidv4 } from 'uuid';

// Initial Mock Data
const INITIAL_CHARACTER: Character = {
  name: "艾瑞克",
  gender: "男",
  class: "流浪冒险者", // Generic start
  level: 1,
  // D&D Standard Array-ish: 15, 14, 13, 12, 10, 8
  stats: { 
    strength: 14, 
    dexterity: 12, 
    constitution: 14, 
    intelligence: 10, 
    wisdom: 10, 
    charisma: 8 
  },
  currentStats: { hp: 0, maxHp: 0, sp: 0, maxSp: 0 }, // Will be calculated by useEffect
  skills: [
    { name: "野外生存", description: "你擅长在荒野中寻找食物、水源，并能准确辨别方向。在森林或山区环境中，你的生存检定具有优势。" },
    { name: "简易武器掌握", description: "你受过基本的使用短剑、匕首、棍棒等简易武器的训练。使用此类武器时，你可以发挥出正常的战斗水平。" }
  ],
  inventory: [
    { id: '1', name: '破旧的短剑', description: '一把普通的铁剑，适合防身。', type: 'weapon', effect: '攻击力 1d6', equipSlot: 'mainHand' },
    { id: '2', name: '旅行者外衣', description: '虽然破旧，但足以遮风挡雨。', type: 'armor', effect: '防御等级(AC) +1', equipSlot: 'chest' },
    { id: '3', name: '干粮', description: '便于保存的硬面包。', type: 'consumable', effect: '体力恢复 5' },
    { id: '4', name: '皮靴', description: '结实的皮靴，适合长途跋涉。', type: 'armor', effect: '敏捷检定+1', equipSlot: 'feet' }
  ],
  equipment: {
    mainHand: null,
    offHand: null,
    head: null,
    chest: null,
    hands: null,
    legs: null,
    feet: null,
    accessory: null
  }
};

const INITIAL_SETTINGS: GameSettings = {
  worldSetting: "这是一个剑与魔法的中世纪世界。王国边境的迷雾森林最近频频出现异动，似乎有古老的邪恶正在苏醒。",
  scriptContent: "玩家作为一名刚来到边境小镇的冒险者，在酒馆里听到了关于'遗忘废墟'的传闻。如果你接受任务，去调查废墟，将会获得镇长的奖励。"
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'profile' | 'game' | 'script'>('profile');
  
  // State
  const [character, setCharacter] = useState<Character>(INITIAL_CHARACTER);
  const [settings, setSettings] = useState<GameSettings>(INITIAL_SETTINGS);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingCheck, setPendingCheck] = useState<CheckRequest | null>(null);

  // Helper to sync HP/SP max when stats change
  useEffect(() => {
    setCharacter(prev => {
      // Logic: MaxHP = CON * 2 + STR. MaxSP = INT + WIS + CHA.
      // D&D usually uses CON mod for HP, but we simplify to attribute based to avoid level complexity yet.
      // Assuming attribute average is 10.
      const newMaxHp = (prev.stats.constitution * 2) + Math.floor(prev.stats.strength / 2); 
      const newMaxSp = prev.stats.intelligence + prev.stats.wisdom + Math.floor(prev.stats.charisma / 2);

      // Adjust current HP/SP if max changes (optional but good UI experience)
      // Only set initial current stats if they are 0 (first load)
      let newCurrentHp = prev.currentStats.hp;
      let newCurrentSp = prev.currentStats.sp;

      if (prev.currentStats.maxHp === 0) {
        newCurrentHp = newMaxHp;
        newCurrentSp = newMaxSp;
      } else {
        // Cap them if they exceed new max
        newCurrentHp = Math.min(newCurrentHp, newMaxHp);
        newCurrentSp = Math.min(newCurrentSp, newMaxSp);
      }
      
      return {
        ...prev,
        currentStats: {
          hp: newCurrentHp,
          maxHp: newMaxHp,
          sp: newCurrentSp,
          maxSp: newMaxSp
        }
      };
    });
  }, [character.stats]); // Dependency on stats object

  const addMessage = (sender: ChatMessage['sender'], content: string, isRoll = false) => {
    setChatHistory(prev => [...prev, {
      id: uuidv4(),
      sender,
      content,
      timestamp: Date.now(),
      isRoll
    }]);
  };

  const processAIResponse = (response: AIResponseSchema) => {
    // 1. Narrate
    if (response.narrative) {
        addMessage('ai', response.narrative);
    }

    // 2. Check for Skill Request
    if (response.checkRequest) {
        setPendingCheck(response.checkRequest);
        // Do not process other stats updates if we are pausing for a check
        return; 
    }

    // 3. Update Stats (only if no check is pending)
    setCharacter(prev => {
      let newChar = { ...prev };
      
      // HP Change
      if (response.hpChange) {
        newChar.currentStats.hp = Math.max(0, Math.min(newChar.currentStats.maxHp, newChar.currentStats.hp + response.hpChange));
      }
      
      // SP Change
      if (response.spChange) {
        newChar.currentStats.sp = Math.max(0, Math.min(newChar.currentStats.maxSp, newChar.currentStats.sp + response.spChange));
      }

      // Base Stats
      if (response.statUpdates) {
        newChar.stats = { ...newChar.stats, ...response.statUpdates };
      }

      // Skills
      if (response.newSkills && response.newSkills.length > 0) {
        // Deduplicate skills by name
        const existingNames = new Set(newChar.skills.map(s => s.name));
        const newSkillsToAdd = response.newSkills.filter(s => !existingNames.has(s.name));
        newChar.skills = [...newChar.skills, ...newSkillsToAdd];
      }

      // Inventory Additions
      if (response.newItems && response.newItems.length > 0) {
        newChar.inventory = [...newChar.inventory, ...response.newItems];
      }

      // Inventory Removals
      if (response.removedItemIds && response.removedItemIds.length > 0) {
        newChar.inventory = newChar.inventory.filter(item => !response.removedItemIds!.includes(item.id));
      }

      return newChar;
    });

    // Notify user of system changes if any
    let systemUpdates = [];
    if (response.hpChange) systemUpdates.push(`体力 ${response.hpChange > 0 ? '+' : ''}${response.hpChange}`);
    if (response.spChange) systemUpdates.push(`精神 ${response.spChange > 0 ? '+' : ''}${response.spChange}`);
    if (response.newItems?.length) systemUpdates.push(`获得物品: ${response.newItems.map(i => i.name).join(', ')}`);
    if (response.newSkills?.length) systemUpdates.push(`习得技能: ${response.newSkills.map(s => s.name).join(', ')}`);
    if (response.statUpdates) systemUpdates.push(`属性已更新`);

    if (systemUpdates.length > 0) {
      addMessage('system', `状态更新: ${systemUpdates.join(' | ')}`);
    }
  };

  const callAI = async (inputText: string) => {
    setIsLoading(true);
    // Prepare history for API
    const apiHistory = chatHistory.slice(-10).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    })).filter(msg => msg.role === 'user' || msg.role === 'model');

    try {
      const response = await generateGMResponse(inputText, apiHistory, character, settings);
      processAIResponse(response);
    } catch (error) {
      console.error(error);
      addMessage('system', 'AI连接中断，请重试。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (text: string) => {
    addMessage('user', text);
    callAI(text);
  };

  const handleDiceRoll = async (sides: number) => {
    // Standard loose dice roll
    const result = Math.floor(Math.random() * sides) + 1;
    const rollMessage = `[系统] 玩家自由投掷了 D${sides}，结果为: ${result}`;
    addMessage('system', rollMessage, true);
    
    // Notify AI of the loose roll
    const prompt = `我投掷了D${sides}，点数是${result}。请根据当前情况判定结果。`;
    callAI(prompt);
  };

  const handleResolveCheck = async (roll: number, modifier: number, attribute: string, dc: number) => {
      const total = roll + modifier;
      const isSuccess = total >= dc;
      const resultText = isSuccess ? "成功" : "失败";
      const attrName = attribute.charAt(0).toUpperCase() + attribute.slice(1);
      
      const message = `[系统] ${attrName} 检定: 1d20(${roll}) + 调整值(${modifier}) = ${total} (DC ${dc}) -> 【${resultText}】`;
      addMessage('system', message, true);
      
      setPendingCheck(null); // Clear the pending check

      // Send the strict result to AI to narrate consequence
      const prompt = `【系统自动消息】玩家完成了 ${attribute} 检定。总分: ${total} (DC: ${dc})。结果: ${resultText}。请根据此结果叙述后续剧情。`;
      callAI(prompt);
  };

  const handleUpdateCharacter = (updates: Partial<Character>) => {
    setCharacter(prev => ({
      ...prev,
      ...updates
    }));
    
    // Log system message about profile change
    if (updates.class && updates.class !== character.class) {
      addMessage('system', `[资料更新] 职业标签变更为: ${updates.class}`);
    }
    if (updates.name && updates.name !== character.name) {
      addMessage('system', `[资料更新] 姓名变更为: ${updates.name}`);
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'profile' && <CharacterSheet character={character} onUpdateCharacter={handleUpdateCharacter} />}
      {activeTab === 'game' && (
        <GameInterface 
          chatHistory={chatHistory} 
          character={character}
          onSendMessage={handleSendMessage}
          onDiceRoll={handleDiceRoll}
          onResolveCheck={handleResolveCheck}
          pendingCheck={pendingCheck}
          isLoading={isLoading}
        />
      )}
      {activeTab === 'script' && (
        <ScriptManager settings={settings} updateSettings={(s) => setSettings(prev => ({ ...prev, ...s }))} />
      )}
    </Layout>
  );
}
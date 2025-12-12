export interface Stats {
  strength: number;      // 力量
  dexterity: number;     // 敏捷
  constitution: number;  // 体质
  intelligence: number;  // 智力
  wisdom: number;        // 感知
  charisma: number;      // 魅力
}

export interface DerivedStats {
  hp: number;
  maxHp: number;
  sp: number;
  maxSp: number;
}

export interface Equipment {
  mainHand: Item | null; // 武器
  offHand: Item | null;  // 副手/盾牌
  head: Item | null;     // 头盔
  chest: Item | null;    // 胸甲
  hands: Item | null;    // 手甲/护臂
  legs: Item | null;     // 裤子/护腿
  feet: Item | null;     // 鞋子
  accessory: Item | null; // 饰品
}

export interface Item {
  id: string;
  name: string;
  description: string;
  effect?: string; // e.g., "Strength +2"
  type: 'weapon' | 'armor' | 'consumable' | 'misc';
  equipSlot?: keyof Equipment; // Which slot this item goes into. If undefined, cannot be equipped.
}

export interface Skill {
  name: string;
  description: string;
}

export interface Character {
  name: string;
  gender: string;
  class: string;
  level: number;
  stats: Stats;
  currentStats: DerivedStats; // For tracking current HP/SP
  skills: Skill[];
  inventory: Item[];
  equipment: Equipment;
}

export interface GameSettings {
  worldSetting: string;
  scriptContent: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  content: string;
  timestamp: number;
  isRoll?: boolean;
}

// Check Request from AI
export interface CheckRequest {
  attribute: keyof Stats;
  difficulty: number; // DC
  reason: string;
}

// The structure we expect the AI to return
export interface AIResponseSchema {
  narrative: string;
  checkRequest?: CheckRequest; // New field for requesting a roll
  hpChange?: number; // Negative for damage, positive for heal
  spChange?: number; // Negative for cost/damage
  statUpdates?: Partial<Stats>;
  newSkills?: Skill[];
  newItems?: Item[];
  removedItemIds?: string[]; // IDs of items to remove
}
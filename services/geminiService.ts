import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Character, GameSettings } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Define the response schema for the AI to ensure structured game updates
const gameResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    narrative: {
      type: Type.STRING,
      description: "The Game Master's narrative description. If requesting a check, just describe the situation leading up to the check.",
    },
    checkRequest: {
      type: Type.OBJECT,
      description: "Ask the player to make an attribute check/saving throw.",
      properties: {
        attribute: { 
          type: Type.STRING, 
          enum: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'],
          description: "The attribute to roll against."
        },
        difficulty: { 
          type: Type.INTEGER,
          description: "The Difficulty Class (DC) of the check (e.g., 10 for easy, 15 medium, 20 hard)."
        },
        reason: {
          type: Type.STRING,
          description: "Short reason for the check (e.g., 'To climb the slippery wall')."
        }
      },
      required: ['attribute', 'difficulty', 'reason']
    },
    hpChange: {
      type: Type.INTEGER,
      description: "Amount to change HP by. Negative for damage, positive for healing. 0 if no change.",
    },
    spChange: {
      type: Type.INTEGER,
      description: "Amount to change SP by. Negative for cost/drain. 0 if no change.",
    },
    statUpdates: {
      type: Type.OBJECT,
      description: "Updates to base attributes.",
      properties: {
        strength: { type: Type.INTEGER },
        dexterity: { type: Type.INTEGER },
        constitution: { type: Type.INTEGER },
        intelligence: { type: Type.INTEGER },
        wisdom: { type: Type.INTEGER },
        charisma: { type: Type.INTEGER },
      },
    },
    newSkills: {
      type: Type.ARRAY,
      items: { 
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING }
        },
        required: ['name', 'description']
      },
      description: "List of new skills acquired. MUST include a short description for each skill.",
    },
    newItems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['weapon', 'armor', 'consumable', 'misc'] },
          effect: { type: Type.STRING },
          equipSlot: { type: Type.STRING, enum: ['mainHand', 'offHand', 'head', 'chest', 'hands', 'legs', 'feet', 'accessory'], description: "Optional slot if item is equipable" }
        },
        required: ['id', 'name', 'description', 'type'],
      },
      description: "List of new items found or given.",
    },
    removedItemIds: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of item IDs to remove from inventory (e.g., consumed potions).",
    },
  },
  required: ['narrative'],
};

export const generateGMResponse = async (
  prompt: string,
  history: { role: string; parts: { text: string }[] }[],
  character: Character,
  settings: GameSettings
) => {
  const model = "gemini-2.5-flash"; 
  
  // Format equipment for context
  const equipmentList = Object.entries(character.equipment)
    .filter(([_, item]) => item !== null)
    .map(([slot, item]) => `${slot}: ${item!.name}`)
    .join(', ');

  // Construct the system instruction with current context
  const systemInstruction = `
    你是一位专业的TRPG跑团主持人（Game Master）。
    
    【核心规则】：
    1. 采用 D&D（龙与地下城）5E 风格规则。
    2. **检定机制（重要）**：当玩家试图做一件有风险、结果不确定的事情时（如攻击敌人、攀爬峭壁、说服守卫、察觉陷阱），**不要直接判定结果**。
       - 请在 JSON 中返回 \`checkRequest\` 对象。
       - 设定一个合理的难度等级 (DC)：简单=10，中等=15，困难=20，极难=25。
       - 指定关键属性 (strength, dexterity 等)。
       - 在 \`narrative\` 中描述动作的前摇，并在最后引导玩家进行检定。
    3. 如果玩家已经发来了“[系统] 检定结果...”的消息，请根据该结果判断成功或失败，并在 \`narrative\` 中描述后果。
    4. **技能习得**：当玩家通过练习或升级习得新技能时，在 \`newSkills\` 中返回，必须包含 \`name\` 和一段生动的 \`description\`（描述该技能的用途或效果）。
    
    【游戏设定】：
    世界设定：${settings.worldSetting || "标准中世纪剑与魔法世界。"}
    剧本/剧情大纲：${settings.scriptContent || "自由探索模式。"}
    
    【当前玩家状态】：
    姓名：${character.name}
    职业标签：${character.class}
    等级：${character.level}
    属性：力${character.stats.strength} 敏${character.stats.dexterity} 体${character.stats.constitution} 智${character.stats.intelligence} 感${character.stats.wisdom} 魅${character.stats.charisma}
    
    【已知技能】：${character.skills.map(s => s.name).join(', ') || '无'}
    【当前装备】：${equipmentList || '无 (赤手空拳)'}
    【行囊物品】：${character.inventory.map(i => i.name).join(', ') || '空'}
    
    【回复要求】：
    1. 始终以JSON格式回复。
    2. 若触发检定，**不要**在 narrative 中描写结果，只描写开始。结果等玩家投骰子后再说。
    3. 只有当玩家受到伤害时 hpChange 才为负数。
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        ...history, // Add previous chat history context
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: gameResponseSchema,
        temperature: 0.7, // Creativity
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback error handling
    return {
      narrative: "主持人似乎正在查阅古籍（AI连接错误，请重试）。",
    };
  }
};

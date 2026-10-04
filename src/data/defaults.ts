import { Achievement, CardDefinition, Difficulty, GameState, Task, TaskType } from "../types/game";
import { nowIso, todayKey, weekKey } from "../utils/date";
import { uid } from "../utils/math";
import gacha345 from "./pjsk-gacha-345.generated.json";

const typeMultiplier: Record<TaskType, number> = { daily: 1, side: 1.35, weekly: 2.4, main: 4 };
const difficultyBase: Record<Difficulty, { crystals: number; exp: number; practice: number; gems: number }> = {
  easy: { crystals: 100, exp: 8, practice: 70, gems: 0 },
  normal: { crystals: 180, exp: 14, practice: 130, gems: 0 },
  hard: { crystals: 300, exp: 24, practice: 240, gems: 1 },
};

export const taskRewardPreset = (type: TaskType, difficulty: Difficulty, target = 1) => {
  const base = difficultyBase[difficulty];
  const multiplier = typeMultiplier[type] * Math.max(1, Math.min(target, 5) * 0.35 + 0.65);
  return {
    crystalReward: Math.round(base.crystals * multiplier / 50) * 50,
    expReward: Math.round(base.exp * multiplier),
    practiceReward: Math.round(base.practice * multiplier / 10) * 10,
    miracleGemReward: Math.max(0, Math.round(base.gems * (type === "main" ? 2 : type === "weekly" ? 1.5 : 1))),
  };
};

const makeTask = (title: string, type: Task["type"], crystalReward: number, expReward: number, attributeRewards: Task["attributeRewards"], difficulty: Task["difficulty"] = "normal", description = "", target?: number): Task => {
  const materials = taskRewardPreset(type, difficulty, target);
  return { id: uid("task"), title, description, type, completed: false, createdAt: nowIso(), crystalReward, expReward, practiceReward: materials.practiceReward, miracleGemReward: materials.miracleGemReward, attributeRewards, difficulty, progress: target ? 0 : undefined, target };
};

export const attributeLabels = { energy: "体力", mood: "心情", discipline: "自律", social: "社交", study: "学业/事业", health: "健康" } as const;
export const cardAttributeLabels = { happy: "欢乐", cool: "帅气", cute: "可爱", pure: "纯真", mysterious: "神秘" } as const;
export const taskTypeLabels = { daily: "每日", weekly: "每周", main: "主线", side: "支线" } as const;
export const systemTips = ["欢迎返回地球服务器。", "完成现实任务，带水晶回到这里。", "主线剧情不会因为一次休息而结束。", "休息也是维持角色状态的重要行动。", "检测到玩家正在认真生活。", "卡池不会催你，按自己的节奏推进。", "失败不会扣除人生点数，重新上线就好。"];

export const ACTIVE_BANNER_ID = "jp-2023-06-colorfes-hyakki";
export const TEST_CRYSTAL_GRANT = 300_000;
export const activeBanner = { id: ACTIVE_BANNER_ID, name: "2023.06 Colorful Festival × 百鬼夜行", subtitle: "一期一会的百鬼夜行！？", fourStarRate: 0.06, threeStarRate: 0.085, twoStarRate: 0.855, crystalPerPull: 300, voucherType: "limited" as const };
export const cardPool = gacha345 as CardDefinition[];
export const dailyLiveMilestones = [
  { count: 1, label: "热身完成", crystals: 0, practiceScore: 200, miracleGems: 0 },
  { count: 3, label: "节奏在线", crystals: 300, practiceScore: 500, miracleGems: 0 },
  { count: 5, label: "FULL COMBO", crystals: 600, practiceScore: 0, miracleGems: 3 },
] as const;

export const defaultAchievements = (): Achievement[] => [
  { id: "first_login", name: "初次登录", description: "第一次进入地球 Online。", icon: "★", unlocked: true, unlockedAt: nowIso(), reward: { crystals: 300 } },
  { id: "first_task", name: "初次行动", description: "完成第一个任务。", icon: "✓", unlocked: false, reward: { crystals: 300 } },
  { id: "task_10", name: "任务新手", description: "累计完成 10 个任务。", icon: "◆", unlocked: false, reward: { crystals: 1000 } },
  { id: "streak_7", name: "稳定运行", description: "连续签到 7 天。", icon: "☀", unlocked: false, reward: { crystals: 1000 } },
  { id: "crystal_3000", name: "一发十连", description: "持有 3000 水晶。", icon: "◈", unlocked: false, reward: { crystals: 300 } },
  { id: "first_four_star", name: "虹光降临", description: "首次获得四星卡牌。", icon: "✦", unlocked: false, reward: { crystals: 500 } },
  { id: "first_character", name: "社交记录员", description: "添加第一个人物。", icon: "♡", unlocked: false, reward: { crystals: 300 } },
  { id: "first_level", name: "人生升级", description: "第一次升级。", icon: "↑", unlocked: false, reward: { crystals: 500 } },
  { id: "first_main", name: "主线推进者", description: "完成第一个主线任务。", icon: "◎", unlocked: false, reward: { crystals: 1000 } },
  { id: "daily_live_clear", name: "今日演出完成", description: "首次达成今日 Live 的全部阶段。", icon: "♬", unlocked: false, reward: { crystals: 500 } },
  { id: "first_training", name: "第一次特训", description: "完成第一张成员的特训。", icon: "✧", unlocked: false, reward: { crystals: 500 } },
  { id: "first_mastery", name: "大师之路", description: "首次提升成员的大师等级。", icon: "◇", unlocked: false, reward: { crystals: 300 } },
];

export const createDefaultGame = (): GameState => {
  const today = todayKey();
  return {
    version: "0.3.0", lastOpenedDate: today, lastDailyResetDate: today, lastWeeklyResetDate: weekKey(),
    player: { name: "旅行者", title: "初入地球的旅行者", chapter: "第一章：适应地球生活", level: 1, exp: 0, crystals: 15000, practiceScore: 4000, miracleGems: 20, wishPieces: 0, limitedVouchers: 0, standardVouchers: 0, attributes: { energy: 70, mood: 70, discipline: 50, social: 50, study: 50, health: 60 }, currentStreak: 0, bestStreak: 0 },
    tasks: [
      makeTask("按时起床", "daily", 150, 10, { discipline: 3, energy: 2 }, "easy", "给今天一个稳定开场。"), makeTask("喝足够的水", "daily", 100, 8, { health: 4 }, "easy", "维护角色基础状态。"), makeTask("学习 30 分钟", "daily", 200, 15, { study: 5, discipline: 2 }, "normal", "推进学习/事业经验条。"), makeTask("整理桌面", "daily", 150, 10, { mood: 2, discipline: 3 }, "easy", "给现实 UI 做一次清理。"), makeTask("运动 15 分钟", "daily", 200, 15, { health: 5, energy: 2 }, "normal", "轻量恢复身体机能。"), makeTask("回复重要消息", "daily", 150, 10, { social: 4 }, "easy", "不需要完美，只要回应。"),
      makeTask("完成一次深度复习", "weekly", 600, 45, { study: 8, discipline: 6 }, "hard"), makeTask("整理一次房间", "weekly", 450, 30, { mood: 6, health: 3 }), makeTask("和朋友进行一次有质量的交流", "weekly", 450, 30, { social: 8, mood: 4 }), makeTask("运动三次", "weekly", 550, 35, { health: 8, energy: 4 }, "hard", "", 3), makeTask("完成本周总结", "weekly", 450, 35, { discipline: 6, study: 4 }),
      makeTask("第一章：适应当前生活", "main", 1500, 120, { mood: 8, discipline: 8 }, "hard", "完成 5 次能让生活稳定的小行动。", 5), makeTask("建立稳定作息", "main", 1200, 90, { energy: 10, health: 8 }, "hard", "慢慢把睡眠和清醒节奏调回来。", 7), makeTask("找到一个长期想发展的方向", "main", 1500, 120, { study: 8, mood: 6 }, "hard", "允许探索，不要求立刻确定。", 4),
      makeTask("去一个没去过的地方散步", "side", 350, 25, { mood: 5, social: 2 }), makeTask("看一部一直想看的电影", "side", 350, 25, { mood: 6 }), makeTask("完成一件拖延已久的小事", "side", 350, 25, { discipline: 5, mood: 3 })
    ],
    ownedCards: [], dailyLive: { date: today, claimedMilestones: [] }, bannerStickers: { [ACTIVE_BANNER_ID]: 0 }, bannerVoucherExchanges: { [ACTIVE_BANNER_ID]: 0 }, characters: [], interactions: [],
    logs: [{ id: uid("log"), type: "system", title: "存档已创建", description: "欢迎来到地球 Online：单机版。", createdAt: nowIso() }], achievements: defaultAchievements(), gachaHistory: [], settings: { animations: true, gachaMusic: true, systemTips: true, theme: "light", focusCharacter: "神代类", targetCardId: cardPool.find((card) => card.sourceId === 672)?.id },
    statistics: { completedTasks: 0, completedDaily: 0, completedWeekly: 0, completedMain: 0, totalCrystalsEarned: 0, totalCrystalsSpent: 0, gachaPulls: 0, fourStarPulled: 0, charactersCreated: 0, interactions: 0, todayCrystals: 0, todayExp: 0, todayDate: today, dailyLiveClears: 0, trainedCards: 0, masteryRanks: 0 }
  };
};

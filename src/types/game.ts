export type TaskType = "daily" | "weekly" | "main" | "side";
export type Difficulty = "easy" | "normal" | "hard";
export type AttributeKey = "energy" | "mood" | "discipline" | "social" | "study" | "health";
export type CardRarity = 2 | 3 | 4;
export type PageKey = "home" | "tasks" | "gacha" | "collection" | "cardList" | "relationships" | "logs" | "achievements" | "settings";
export type LogType = "task" | "level" | "gacha" | "reward" | "relationship" | "system";

export interface AttributeRewards { energy?: number; mood?: number; discipline?: number; social?: number; study?: number; health?: number; }
export interface Player { name: string; title: string; chapter: string; level: number; exp: number; crystals: number; practiceScore: number; miracleGems: number; wishPieces: number; limitedVouchers: number; standardVouchers: number; attributes: Record<AttributeKey, number>; lastCheckInDate?: string; currentStreak: number; bestStreak: number; }
export interface Task { id: string; title: string; description: string; type: TaskType; completed: boolean; createdAt: string; completedAt?: string; crystalReward: number; expReward: number; practiceReward: number; miracleGemReward: number; attributeRewards: AttributeRewards; difficulty: Difficulty; deadline?: string; progress?: number; target?: number; }

export interface CardDefinition { id: string; sourceId: number; character: string; title: string; titleJa?: string; gachaPhrase?: string; rarity: CardRarity; attribute: "happy" | "cool" | "cute" | "pure" | "mysterious"; imageUrl: string; trainedImageUrl?: string; featured: boolean; limited: boolean; festival?: boolean; weight: number; }
export interface OwnedCard { cardId: string; count: number; firstObtainedAt: string; lastObtainedAt: string; level?: number; trained?: boolean; masteryRank?: number; favorite?: boolean; }

export interface Character { id: string; name: string; nickname?: string; avatar: string; relationshipType: string; favorability: number; familiarity: number; stability: number; notes: string; tags: string[]; createdAt: string; lastInteractionAt?: string; }
export interface Interaction { id: string; characterId: string; title: string; note: string; date: string; favorabilityChange: number; familiarityChange: number; stabilityChange: number; }
export interface LogEntry { id: string; type: LogType; title: string; description: string; createdAt: string; }
export interface Achievement { id: string; name: string; description: string; icon: string; unlocked: boolean; unlockedAt?: string; reward: { crystals?: number; exp?: number }; }
export interface GachaRecord { id: string; bannerId: string; cardId: string; rarity: CardRarity; isNew: boolean; createdAt: string; }
export interface CardPull { cardId: string; rarity: CardRarity; isNew: boolean; wishPieces?: number; }
export interface GameSettings { animations: boolean; gachaMusic?: boolean; systemTips: boolean; theme: "light" | "dark"; focusCharacter?: string; targetCardId?: string; }
export interface DailyLive { date: string; claimedMilestones: number[]; }
export interface Statistics { completedTasks: number; completedDaily: number; completedWeekly: number; completedMain: number; totalCrystalsEarned: number; totalCrystalsSpent: number; gachaPulls: number; fourStarPulled: number; charactersCreated: number; interactions: number; todayCrystals: number; todayExp: number; todayDate: string; dailyLiveClears: number; trainedCards: number; masteryRanks: number; }
export interface GameState { version: string; lastOpenedDate: string; lastDailyResetDate: string; lastWeeklyResetDate: string; player: Player; tasks: Task[]; ownedCards: OwnedCard[]; dailyLive: DailyLive; bannerStickers: Record<string, number>; bannerVoucherExchanges: Record<string, number>; characters: Character[]; interactions: Interaction[]; logs: LogEntry[]; achievements: Achievement[]; gachaHistory: GachaRecord[]; settings: GameSettings; statistics: Statistics; }

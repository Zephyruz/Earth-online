import { ACTIVE_BANNER_ID, createDefaultGame, defaultAchievements } from "../data/defaults";
import { GameState } from "../types/game";

const STORAGE_KEY = "earth-online-solo-save";
type Legacy = Record<string, any>;
const PILOT_CARD_IDS = new Set(["rui-sentimental-snapshot", "shizuku-seasonal-snow", "tsukasa-victory-decided", "kohane-footprints-kaleidoscope", "akito-thirsting-wanderer", "mafuyu-rest-time", "airi-having-fun"]);

const isGameState = (value: unknown): value is GameState => {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<GameState>;
  return Boolean(state.player && Array.isArray(state.tasks) && Array.isArray(state.logs) && state.settings && state.statistics);
};

const migrate = (raw: Legacy): GameState => {
  if (raw.version === "0.2.1" && isGameState(raw)) return raw;
  const fresh = createDefaultGame(); const oldPlayer = raw.player ?? {}; const oldStats = raw.statistics ?? {};
  const pilotHistory = raw.version === "0.2.0" && Array.isArray(raw.gachaHistory) ? raw.gachaHistory.filter((item: Legacy) => PILOT_CARD_IDS.has(item.cardId)) : [];
  const refundedPulls = pilotHistory.length;
  const refundedFourStars = pilotHistory.filter((item: Legacy) => item.rarity === 4).length;
  const pilotAchievement = refundedPulls > 0 && (raw.achievements ?? []).some((item: Legacy) => item.id === "crystal_3000" && item.unlocked);
  const achievements = defaultAchievements().map((next) => { const previous = (raw.achievements ?? []).find((item: Legacy) => item.id === next.id || (next.id === "crystal_3000" && item.id === "gold_500") || (next.id === "first_four_star" && item.id === "first_ssr")); return previous ? { ...next, unlocked: Boolean(previous.unlocked), unlockedAt: previous.unlockedAt } : next; });
  if (pilotAchievement) { const item = achievements.find((achievement) => achievement.id === "crystal_3000"); if (item) { item.unlocked = false; item.unlockedAt = undefined; } }
  const convertedCrystals = raw.version === "0.2.0" ? Number(oldPlayer.crystals ?? 15000) : Math.max(15000, Number(oldPlayer.crystals ?? 0), Number(oldPlayer.gold ?? 0) * 100 + Number(oldPlayer.tickets ?? 0) * 300);
  return {
    ...fresh, ...raw, version: "0.2.1",
    player: { ...fresh.player, ...oldPlayer, crystals: convertedCrystals + refundedPulls * 300 - (pilotAchievement ? 300 : 0), limitedVouchers: Number(oldPlayer.limitedVouchers ?? 0), standardVouchers: Number(oldPlayer.standardVouchers ?? 0), gold: undefined, tickets: undefined },
    tasks: (raw.tasks ?? fresh.tasks).map((task: Legacy) => ({ ...task, crystalReward: Number(task.crystalReward ?? (typeof task.goldReward === "number" ? task.goldReward * 10 : 150)), goldReward: undefined, ticketReward: undefined })),
    ownedCards: (raw.ownedCards ?? []).filter((item: Legacy) => !PILOT_CARD_IDS.has(item.cardId)), bannerStickers: { ...(raw.bannerStickers ?? {}), [ACTIVE_BANNER_ID]: Math.max(0, Number(raw.bannerStickers?.[ACTIVE_BANNER_ID] ?? 0) - refundedPulls) }, bannerVoucherExchanges: raw.bannerVoucherExchanges ?? { [ACTIVE_BANNER_ID]: 0 }, achievements,
    gachaHistory: Array.isArray(raw.gachaHistory) && raw.gachaHistory.every((item: Legacy) => item.cardId) ? raw.gachaHistory.filter((item: Legacy) => !PILOT_CARD_IDS.has(item.cardId)) : [],
    logs: (raw.logs ?? fresh.logs).filter((item: Legacy) => !(refundedPulls > 0 && ((item.type === "gacha" && ["首次获得，已登录图鉴。", "重复获得，收藏计数 +1。"].includes(item.description)) || (pilotAchievement && item.title === "解锁成就《一发十连》")))),
    settings: { animations: raw.settings?.animations ?? true, gachaMusic: raw.settings?.gachaMusic ?? true, systemTips: raw.settings?.systemTips ?? true, theme: raw.settings?.theme ?? "light" },
    statistics: { ...fresh.statistics, ...oldStats, totalCrystalsEarned: Math.max(0, Number(oldStats.totalCrystalsEarned ?? (typeof oldStats.totalGoldEarned === "number" ? oldStats.totalGoldEarned * 10 : 0)) - (pilotAchievement ? 300 : 0)), totalCrystalsSpent: Math.max(0, Number(oldStats.totalCrystalsSpent ?? (typeof oldStats.totalGoldSpent === "number" ? oldStats.totalGoldSpent * 10 : 0)) - refundedPulls * 300), gachaPulls: Math.max(0, Number(oldStats.gachaPulls ?? 0) - refundedPulls), fourStarPulled: Math.max(0, Number(oldStats.fourStarPulled ?? oldStats.ssrPulled ?? 0) - refundedFourStars), todayCrystals: Number(oldStats.todayCrystals ?? (typeof oldStats.todayGold === "number" ? oldStats.todayGold * 10 : 0)) }
  } as GameState;
};

export const loadGame = (): GameState => { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return createDefaultGame(); try { const parsed = JSON.parse(raw); return isGameState(parsed) ? migrate(parsed as Legacy) : createDefaultGame(); } catch { return createDefaultGame(); } };
export const saveGame = (state: GameState) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
export const resetGame = () => { const state = createDefaultGame(); saveGame(state); return state; };
export const exportSave = (state: GameState) => JSON.stringify(state, null, 2);
export const importSave = (text: string): GameState => { const parsed = JSON.parse(text); if (!isGameState(parsed)) throw new Error("存档格式不正确。"); return migrate(parsed as Legacy); };

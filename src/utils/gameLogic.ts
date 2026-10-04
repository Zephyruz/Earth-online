import { activeBanner, cardPool, dailyLiveMilestones } from "../data/defaults";
import { CardPull, Character, GameState, Interaction, LogType, Task } from "../types/game";
import { isYesterday, nowIso, todayKey, weekKey } from "./date";
import { clamp, requiredExp, uid } from "./math";
import { pickCard, rollGuaranteedRarity, rollRarity } from "./gacha";
import { baseMaxLevel, currentCardLevel, currentMasteryRank, levelUpPreview, masteryCost, maxCardLevel, trainingCost } from "./cardProgress";

const log = (state: GameState, type: LogType, title: string, description: string) => state.logs.unshift({ id: uid("log"), type, title, description, createdAt: nowIso() });
export const addLog = (state: GameState, type: LogType, title: string, description: string): GameState => { const next = structuredClone(state); log(next, type, title, description); return next; };

export const normalizeGameDates = (state: GameState): GameState => {
  const next = structuredClone(state); const today = todayKey(); const week = weekKey();
  if (next.statistics.todayDate !== today) { next.statistics.todayDate = today; next.statistics.todayCrystals = 0; next.statistics.todayExp = 0; }
  if (next.lastDailyResetDate !== today) { next.tasks = next.tasks.map((task) => task.type === "daily" ? { ...task, completed: false, completedAt: undefined, progress: task.target ? 0 : undefined } : task); next.lastDailyResetDate = today; log(next, "system", "每日任务已刷新", "新的地球日开始了，昨日努力仍保存在日志里。"); }
  if (next.dailyLive.date !== today) next.dailyLive = { date: today, claimedMilestones: [] };
  if (next.lastWeeklyResetDate !== week) { next.tasks = next.tasks.map((task) => task.type === "weekly" ? { ...task, completed: false, completedAt: undefined } : task); next.lastWeeklyResetDate = week; log(next, "system", "每周任务已刷新", "本周副本已开启，请按自己的节奏推进。"); }
  grantDailyLiveRewards(next);
  next.lastOpenedDate = today; return checkAchievements(next);
};

export const addExpAndLevel = (state: GameState, exp: number) => {
  state.player.exp += exp;
  while (state.player.exp >= requiredExp(state.player.level)) { state.player.exp -= requiredExp(state.player.level); state.player.level += 1; state.player.crystals += 500; state.statistics.totalCrystalsEarned += 500; state.player.attributes.energy = clamp(state.player.attributes.energy + 10); state.player.attributes.mood = clamp(state.player.attributes.mood + 10); log(state, "level", `等级提升至 Lv.${state.player.level}`, "获得水晶 ×500，体力和心情轻微恢复。"); }
};

export const upsertTask = (state: GameState, task: Task): GameState => { const next = structuredClone(state); const index = next.tasks.findIndex((item) => item.id === task.id); if (index >= 0) next.tasks[index] = task; else next.tasks.unshift(task); log(next, "task", index >= 0 ? "任务已编辑" : "新增任务", task.title); return next; };
export const deleteTask = (state: GameState, taskId: string): GameState => { const next = structuredClone(state); const task = next.tasks.find((item) => item.id === taskId); next.tasks = next.tasks.filter((item) => item.id !== taskId); if (task) log(next, "task", `删除任务《${task.title}》`, "任务已从列表移除。"); return next; };

const grantDailyLiveRewards = (state: GameState) => {
  const completed = state.tasks.filter((task) => task.type === "daily" && task.completed).length;
  dailyLiveMilestones.forEach((milestone) => {
    if (completed < milestone.count || state.dailyLive.claimedMilestones.includes(milestone.count)) return;
    state.dailyLive.claimedMilestones.push(milestone.count);
    state.player.crystals += milestone.crystals;
    state.player.practiceScore += milestone.practiceScore;
    state.player.miracleGems += milestone.miracleGems;
    state.statistics.totalCrystalsEarned += milestone.crystals;
    state.statistics.todayCrystals += milestone.crystals;
    if (milestone.count === 5) state.statistics.dailyLiveClears += 1;
    const rewards = [milestone.crystals && `水晶 ×${milestone.crystals}`, milestone.practiceScore && `练习乐谱 ×${milestone.practiceScore}`, milestone.miracleGems && `奇迹结晶 ×${milestone.miracleGems}`].filter(Boolean).join("、");
    log(state, "reward", `今日 Live · ${milestone.label}`, rewards);
  });
};

export const completeTask = (state: GameState, taskId: string): GameState => {
  const next = structuredClone(state); const task = next.tasks.find((item) => item.id === taskId); if (!task || task.completed) return next;
  task.completed = true; task.completedAt = nowIso(); if (task.target) task.progress = task.target;
  next.player.crystals += task.crystalReward; next.player.practiceScore += task.practiceReward; next.player.miracleGems += task.miracleGemReward; next.statistics.totalCrystalsEarned += task.crystalReward; next.statistics.todayCrystals += task.crystalReward; next.statistics.todayExp += task.expReward; addExpAndLevel(next, task.expReward);
  Object.entries(task.attributeRewards).forEach(([key, value]) => { const attr = key as keyof typeof next.player.attributes; next.player.attributes[attr] = clamp(next.player.attributes[attr] + (value ?? 0)); });
  next.statistics.completedTasks += 1; if (task.type === "daily") next.statistics.completedDaily += 1; if (task.type === "weekly") next.statistics.completedWeekly += 1; if (task.type === "main") next.statistics.completedMain += 1;
  log(next, "task", `完成任务《${task.title}》`, `获得水晶 ×${task.crystalReward}、练习乐谱 ×${task.practiceReward}${task.miracleGemReward ? `、奇迹结晶 ×${task.miracleGemReward}` : ""}、经验 ×${task.expReward}。`);
  if (task.type === "daily") grantDailyLiveRewards(next);
  return checkAchievements(next);
};

export const advanceTaskProgress = (state: GameState, taskId: string): GameState => {
  const next = structuredClone(state); const task = next.tasks.find((item) => item.id === taskId);
  if (!task || task.completed || !task.target) return next;
  task.progress = Math.min(task.target, (task.progress ?? 0) + 1);
  if (task.progress >= task.target) return completeTask(next, taskId);
  log(next, "task", `推进任务《${task.title}》`, `当前进度 ${task.progress} / ${task.target}。`);
  return next;
};

export const undoTask = (state: GameState, taskId: string): GameState => {
  const next = structuredClone(state); const task = next.tasks.find((item) => item.id === taskId); if (!task || !task.completed) return next;
  task.completed = false; task.completedAt = undefined; task.progress = task.target ? Math.max(0, task.target - 1) : task.progress; next.player.crystals = Math.max(0, next.player.crystals - task.crystalReward); next.player.practiceScore = Math.max(0, next.player.practiceScore - task.practiceReward); next.player.miracleGems = Math.max(0, next.player.miracleGems - task.miracleGemReward); next.player.exp = Math.max(0, next.player.exp - task.expReward); next.statistics.completedTasks = Math.max(0, next.statistics.completedTasks - 1); next.statistics.todayCrystals = Math.max(0, next.statistics.todayCrystals - task.crystalReward); next.statistics.todayExp = Math.max(0, next.statistics.todayExp - task.expReward);
  if (task.type === "daily") next.statistics.completedDaily = Math.max(0, next.statistics.completedDaily - 1); if (task.type === "weekly") next.statistics.completedWeekly = Math.max(0, next.statistics.completedWeekly - 1); if (task.type === "main") next.statistics.completedMain = Math.max(0, next.statistics.completedMain - 1);
  Object.entries(task.attributeRewards).forEach(([key, value]) => { const attr = key as keyof typeof next.player.attributes; next.player.attributes[attr] = clamp(next.player.attributes[attr] - (value ?? 0)); }); log(next, "task", `撤销任务《${task.title}》`, "本次任务的水晶、养成材料与经验已回收。"); return next;
};

const duplicateWishPieces = { 2: 5, 3: 50, 4: 200 } as const;
const receiveCard = (state: GameState, cardId: string) => {
  const time = nowIso(); const card = cardPool.find((item) => item.id === cardId); const owned = state.ownedCards.find((item) => item.cardId === cardId); const isNew = !owned;
  const wishPieces = !isNew && card ? duplicateWishPieces[card.rarity] : 0;
  if (owned) { owned.count += 1; owned.lastObtainedAt = time; state.player.wishPieces += wishPieces; } else state.ownedCards.unshift({ cardId, count: 1, firstObtainedAt: time, lastObtainedAt: time, level: 1, trained: false, masteryRank: 0, favorite: false });
  return { isNew, wishPieces };
};

export const levelUpOwnedCard = (state: GameState, cardId: string): GameState => {
  const next = structuredClone(state); const owned = next.ownedCards.find((item) => item.cardId === cardId); const card = cardPool.find((item) => item.id === cardId);
  if (!owned || !card) throw new Error("没有找到这张已拥有卡牌。");
  const level = currentCardLevel(owned); const maxLevel = maxCardLevel(card, owned); const preview = levelUpPreview(card, owned);
  if (level >= maxLevel) throw new Error(owned.trained || card.rarity === 2 ? "这张卡已达到当前最高等级。" : "等级已满，可以进行特训。");
  if (next.player.practiceScore < preview.cost) throw new Error(`练习乐谱不足，还需要 ${preview.cost - next.player.practiceScore}。`);
  next.player.practiceScore -= preview.cost; owned.level = preview.targetLevel; log(next, "reward", `提升《${card.title}》等级`, `消耗练习乐谱 ×${preview.cost}，当前等级 Lv.${owned.level}。`); return next;
};

export const trainOwnedCard = (state: GameState, cardId: string): GameState => {
  const next = structuredClone(state); const owned = next.ownedCards.find((item) => item.cardId === cardId); const card = cardPool.find((item) => item.id === cardId);
  if (!owned || !card) throw new Error("没有找到这张已拥有卡牌。");
  if (card.rarity < 3 || !card.trainedImageUrl) throw new Error("这张卡没有花后卡面。");
  if (owned.trained) throw new Error("这张卡已经完成特训。");
  if (currentCardLevel(owned) < baseMaxLevel(card)) throw new Error(`需要先升到 Lv.${baseMaxLevel(card)}。`);
  const cost = trainingCost(card); if (next.player.miracleGems < cost) throw new Error(`奇迹结晶不足，还需要 ${cost - next.player.miracleGems}。`);
  next.player.miracleGems -= cost; owned.trained = true; next.statistics.trainedCards += 1; log(next, "reward", `完成《${card.title}》特训`, `消耗奇迹结晶 ×${cost}，花后卡面已经解锁，等级上限提升 10 级。`); return checkAchievements(next);
};

export const increaseMasteryRank = (state: GameState, cardId: string): GameState => {
  const next = structuredClone(state); const owned = next.ownedCards.find((item) => item.cardId === cardId); const card = cardPool.find((item) => item.id === cardId);
  if (!owned || !card) throw new Error("没有找到这张已拥有卡牌。");
  const rank = currentMasteryRank(owned); if (rank >= 5) throw new Error("这张卡的大师等级已经达到上限。");
  const cost = masteryCost(card); if (next.player.wishPieces < cost) throw new Error(`心愿碎片不足，还需要 ${cost - next.player.wishPieces}。`);
  next.player.wishPieces -= cost; owned.masteryRank = rank + 1; next.statistics.masteryRanks += 1;
  log(next, "reward", `《${card.title}》大师等级提升`, `消耗心愿碎片 ×${cost}，大师等级达到 ${owned.masteryRank}。`); return checkAchievements(next);
};

export const toggleFavoriteCard = (state: GameState, cardId: string): GameState => {
  const next = structuredClone(state); const owned = next.ownedCards.find((item) => item.cardId === cardId); if (!owned) return next;
  owned.favorite = !owned.favorite; return next;
};

export const drawGacha = (state: GameState, count: 1 | 10): { state: GameState; results: CardPull[] } => {
  const next = structuredClone(state); const cost = count * activeBanner.crystalPerPull; if (next.player.crystals < cost) throw new Error(`水晶不足，还需要 ${cost - next.player.crystals} 水晶。`);
  next.player.crystals -= cost; next.statistics.totalCrystalsSpent += cost; const results: CardPull[] = [];
  const rolled = Array.from({ length: count }, () => rollRarity()); if (count === 10 && !rolled.some((rarity) => rarity >= 3)) rolled[9] = rollGuaranteedRarity();
  rolled.forEach((rarity) => { const card = pickCard(rarity); const received = receiveCard(next, card.id); results.push({ cardId: card.id, rarity, isNew: received.isNew, wishPieces: received.wishPieces }); next.gachaHistory.unshift({ id: uid("gacha"), bannerId: activeBanner.id, cardId: card.id, rarity, isNew: received.isNew, createdAt: nowIso() }); next.statistics.gachaPulls += 1; if (rarity === 4) next.statistics.fourStarPulled += 1; log(next, "gacha", `${rarity}★《${card.title}》${card.character}`, received.isNew ? "首次获得，已登录图鉴。" : `重复获得，转化为心愿碎片 ×${received.wishPieces}。`); });
  next.bannerStickers[activeBanner.id] = (next.bannerStickers[activeBanner.id] ?? 0) + count; return { state: checkAchievements(next), results };
};

export const exchangeVoucher = (state: GameState): GameState => {
  const next = structuredClone(state); const stickers = next.bannerStickers[activeBanner.id] ?? 0; const exchanged = next.bannerVoucherExchanges[activeBanner.id] ?? 0;
  if (stickers < 10) throw new Error("兑换 1 张招募券需要 10 枚贴纸。"); if (exchanged >= 10) throw new Error("本期最多兑换 10 张招募券。");
  next.bannerStickers[activeBanner.id] = stickers - 10; next.bannerVoucherExchanges[activeBanner.id] = exchanged + 1; next.player.limitedVouchers += 1; log(next, "reward", "兑换限定招募券", "消耗本期贴纸 ×10。"); return next;
};

export const exchangeFeaturedCard = (state: GameState, cardId: string): GameState => {
  const next = structuredClone(state); const card = cardPool.find((item) => item.id === cardId && item.featured && item.rarity === 4); if (!card) throw new Error("这张卡不在本期兑换范围内。");
  const stickers = next.bannerStickers[activeBanner.id] ?? 0; const voucherRoute = stickers >= 200 && next.player.limitedVouchers >= 10;
  if (stickers >= 300) next.bannerStickers[activeBanner.id] = stickers - 300; else if (voucherRoute) { next.bannerStickers[activeBanner.id] = stickers - 200; next.player.limitedVouchers -= 10; } else throw new Error("需要 300 枚贴纸，或 200 枚贴纸＋10 张限定招募券。");
  const received = receiveCard(next, cardId); log(next, "reward", `兑换《${card.title}》${card.character}`, received.isNew ? "首次获得，已登录图鉴。" : `重复获得，转化为心愿碎片 ×${received.wishPieces}。`); return next;
};

export const checkIn = (state: GameState): GameState => {
  const next = structuredClone(state); const today = todayKey(); if (next.player.lastCheckInDate === today) return next; next.player.currentStreak = isYesterday(next.player.lastCheckInDate) ? next.player.currentStreak + 1 : 1; next.player.bestStreak = Math.max(next.player.bestStreak, next.player.currentStreak); next.player.lastCheckInDate = today;
  let crystals = 200; if (next.player.currentStreak % 30 === 0) crystals += 3000; else if (next.player.currentStreak % 14 === 0) crystals += 1000; else if (next.player.currentStreak % 7 === 0) crystals += 500; else if (next.player.currentStreak % 3 === 0) crystals += 300;
  next.player.crystals += crystals; next.statistics.totalCrystalsEarned += crystals; next.statistics.todayCrystals += crystals; next.statistics.todayExp += 10; addExpAndLevel(next, 10); log(next, "system", "今日签到完成", `连续签到 ${next.player.currentStreak} 天，获得水晶 ×${crystals}、经验 ×10。`); return checkAchievements(next);
};

export const upsertCharacter = (state: GameState, character: Character): GameState => { const next = structuredClone(state); const normalized = { ...character, favorability: clamp(character.favorability), familiarity: clamp(character.familiarity), stability: clamp(character.stability) }; const index = next.characters.findIndex((item) => item.id === normalized.id); if (index >= 0) next.characters[index] = normalized; else { next.characters.unshift(normalized); next.statistics.charactersCreated += 1; } log(next, "relationship", index >= 0 ? `编辑人物《${normalized.name}》` : `新增人物《${normalized.name}》`, "关系记录已更新。"); return checkAchievements(next); };
export const deleteCharacter = (state: GameState, characterId: string): GameState => { const next = structuredClone(state); const character = next.characters.find((item) => item.id === characterId); next.characters = next.characters.filter((item) => item.id !== characterId); next.interactions = next.interactions.filter((item) => item.characterId !== characterId); if (character) log(next, "relationship", `删除人物《${character.name}》`, "相关互动记录也已移除。"); return next; };
export const addInteraction = (state: GameState, interaction: Interaction): GameState => { const next = structuredClone(state); const character = next.characters.find((item) => item.id === interaction.characterId); if (!character) return next; next.interactions.unshift(interaction); character.favorability = clamp(character.favorability + interaction.favorabilityChange); character.familiarity = clamp(character.familiarity + interaction.familiarityChange); character.stability = clamp(character.stability + interaction.stabilityChange); character.lastInteractionAt = interaction.date; next.statistics.interactions += 1; log(next, "relationship", `与《${character.name}》记录互动`, `${interaction.title}：好感 ${interaction.favorabilityChange >= 0 ? "+" : ""}${interaction.favorabilityChange}`); return next; };

export const checkAchievements = (state: GameState): GameState => {
  const next = structuredClone(state); const unlock = (id: string) => { const item = next.achievements.find((achievement) => achievement.id === id); if (!item || item.unlocked) return; item.unlocked = true; item.unlockedAt = nowIso(); const crystals = item.reward.crystals ?? 0; next.player.crystals += crystals; next.statistics.totalCrystalsEarned += crystals; addExpAndLevel(next, item.reward.exp ?? 0); log(next, "system", `解锁成就《${item.name}》`, `${item.description} 水晶 ×${crystals}`); };
  if (next.statistics.completedTasks >= 1) unlock("first_task"); if (next.statistics.completedTasks >= 10) unlock("task_10"); if (next.player.currentStreak >= 7) unlock("streak_7"); if (next.player.crystals >= 3000) unlock("crystal_3000"); if (next.statistics.fourStarPulled >= 1) unlock("first_four_star"); if (next.statistics.charactersCreated >= 1) unlock("first_character"); if (next.player.level >= 2) unlock("first_level"); if (next.statistics.completedMain >= 1) unlock("first_main"); if (next.statistics.dailyLiveClears >= 1) unlock("daily_live_clear"); if (next.statistics.trainedCards >= 1) unlock("first_training"); if (next.statistics.masteryRanks >= 1) unlock("first_mastery"); return next;
};

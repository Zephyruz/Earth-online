import { useMemo, useState } from "react";
import { cardAttributeLabels, cardPool } from "../data/defaults";
import { CardRarity, GameState } from "../types/game";
import { increaseMasteryRank, levelUpOwnedCard, toggleFavoriteCard, trainOwnedCard } from "../utils/gameLogic";
import { CardArt } from "./CardArt";
import { CardDetailModal } from "./CardDetailModal";

type RarityFilter = "all" | CardRarity;
type TrainingFilter = "all" | "trained" | "untrained";
type SortMode = "rarity" | "level" | "recent" | "count";

export const CardList = ({ game, onChange, onNotify }: { game: GameState; onChange: (game: GameState) => void; onNotify: (message: string) => void }) => {
  const [rarity, setRarity] = useState<RarityFilter>("all");
  const [character, setCharacter] = useState("all");
  const [attribute, setAttribute] = useState("all");
  const [training, setTraining] = useState<TrainingFilter>("all");
  const [query, setQuery] = useState("");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("rarity");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const ownedById = useMemo(() => new Map(game.ownedCards.map((item) => [item.cardId, item])), [game.ownedCards]);
  const characters = useMemo(() => Array.from(new Set(cardPool.map((card) => card.character))), []);
  const selectedCard = selectedCardId ? cardPool.find((card) => card.id === selectedCardId) ?? null : null;
  const selectedOwned = selectedCard ? ownedById.get(selectedCard.id) : undefined;

  const cards = useMemo(() => cardPool.filter((card) => {
    const owned = ownedById.get(card.id); if (!owned) return false;
    if (rarity !== "all" && card.rarity !== rarity) return false;
    if (character !== "all" && card.character !== character) return false;
    if (attribute !== "all" && card.attribute !== attribute) return false;
    if (training === "trained" && !owned.trained) return false;
    if (training === "untrained" && owned.trained) return false;
    if (favoriteOnly && !owned.favorite) return false;
    const keyword = query.trim().toLowerCase(); return !keyword || `${card.character}${card.title}`.toLowerCase().includes(keyword);
  }).sort((a, b) => {
    const aOwned = ownedById.get(a.id)!; const bOwned = ownedById.get(b.id)!;
    const favoriteDelta = Number(Boolean(bOwned.favorite)) - Number(Boolean(aOwned.favorite));
    if (favoriteDelta) return favoriteDelta;
    if (sortMode === "level") return (bOwned.level ?? 1) - (aOwned.level ?? 1) || b.rarity - a.rarity;
    if (sortMode === "recent") return bOwned.lastObtainedAt.localeCompare(aOwned.lastObtainedAt);
    if (sortMode === "count") return bOwned.count - aOwned.count || b.rarity - a.rarity;
    return b.rarity - a.rarity || (bOwned.level ?? 1) - (aOwned.level ?? 1);
  }), [attribute, character, favoriteOnly, ownedById, query, rarity, sortMode, training]);

  const mutate = (action: (state: GameState, cardId: string) => GameState) => {
    if (!selectedCard) return;
    try { onChange(action(game, selectedCard.id)); } catch (error) { onNotify(error instanceof Error ? error.message : "操作失败"); }
  };

  return <section className="panel card-list-page">
    <div className="section-head"><div><p className="eyebrow">OWNED MEMBERS</p><h2>卡牌一览</h2></div><strong>{game.ownedCards.length} 张已拥有</strong></div>
    <div className="member-wallet"><span>♫ 练习乐谱 <strong>{game.player.practiceScore.toLocaleString()}</strong></span><span>✧ 奇迹结晶 <strong>{game.player.miracleGems}</strong></span><span>◇ 心愿碎片 <strong>{game.player.wishPieces}</strong></span></div>
    <p className="muted">任务获得练习乐谱和奇迹结晶；重复成员会转化为心愿碎片。3★/4★完成特训后才能查看花后。</p>
    <div className="card-list-filters">
      <input aria-label="搜索已拥有卡牌" placeholder="搜索角色或中文卡名" value={query} onChange={(event) => setQuery(event.target.value)} />
      <select aria-label="筛选角色" value={character} onChange={(event) => setCharacter(event.target.value)}><option value="all">全部角色</option>{characters.map((name) => <option key={name}>{name}</option>)}</select>
      <select aria-label="筛选稀有度" value={rarity} onChange={(event) => setRarity(event.target.value === "all" ? "all" : Number(event.target.value) as CardRarity)}><option value="all">全部稀有度</option><option value="2">2★</option><option value="3">3★</option><option value="4">4★</option></select>
      <select aria-label="筛选属性" value={attribute} onChange={(event) => setAttribute(event.target.value)}><option value="all">全部属性</option>{Object.entries(cardAttributeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <select aria-label="筛选特训状态" value={training} onChange={(event) => setTraining(event.target.value as TrainingFilter)}><option value="all">全部特训状态</option><option value="trained">已特训</option><option value="untrained">未特训</option></select>
      <select aria-label="排序方式" value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}><option value="rarity">稀有度优先</option><option value="level">等级优先</option><option value="recent">最近获得</option><option value="count">获得次数</option></select>
      <button className={favoriteOnly ? "filter-favorite active" : "filter-favorite ghost"} onClick={() => setFavoriteOnly((value) => !value)}>{favoriteOnly ? "♥ 只看收藏" : "♡ 收藏筛选"}</button>
    </div>
    <div className="collection-grid owned-card-grid">{cards.map((card) => { const owned = ownedById.get(card.id)!; return <button key={card.id} className={`collection-card owned collection-card-button ${owned.favorite ? "is-favorite" : ""}`} onClick={() => setSelectedCardId(card.id)}>{owned.favorite && <span className="card-favorite-mark">♥</span>}<CardArt card={card} trained={Boolean(owned.trained)} /><div className="collection-meta"><small>{card.rarity}★ · Lv.{owned.level ?? 1} · 大师 {owned.masteryRank ?? 0}</small><h3>{card.character}</h3><p>「{card.title}」</p><b>{owned.trained ? "已特训" : "未特训"} · 获得 ×{owned.count}</b></div></button>; })}</div>
    {cards.length === 0 && <div className="empty">没有符合筛选条件的已拥有卡牌。</div>}
    {selectedCard && selectedOwned && <CardDetailModal card={selectedCard} owned={selectedOwned} resources={game.player} trainedUnlocked={Boolean(selectedOwned.trained)} onLevelUp={() => mutate(levelUpOwnedCard)} onTrain={() => mutate(trainOwnedCard)} onMastery={() => mutate(increaseMasteryRank)} onFavorite={() => mutate(toggleFavoriteCard)} onClose={() => setSelectedCardId(null)} />}
  </section>;
};

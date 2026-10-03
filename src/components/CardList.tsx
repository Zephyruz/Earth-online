import { useMemo, useState } from "react";
import { cardPool } from "../data/defaults";
import { CardRarity, GameState } from "../types/game";
import { levelUpOwnedCard, trainOwnedCard } from "../utils/gameLogic";
import { CardArt } from "./CardArt";
import { CardDetailModal } from "./CardDetailModal";

type RarityFilter = "all" | CardRarity;
type TrainingFilter = "all" | "trained" | "untrained";

export const CardList = ({ game, onChange }: { game: GameState; onChange: (game: GameState) => void }) => {
  const [rarity, setRarity] = useState<RarityFilter>("all");
  const [character, setCharacter] = useState("all");
  const [attribute, setAttribute] = useState("all");
  const [training, setTraining] = useState<TrainingFilter>("all");
  const [query, setQuery] = useState("");
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
    const keyword = query.trim().toLowerCase(); return !keyword || `${card.character}${card.title}`.toLowerCase().includes(keyword);
  }), [attribute, character, ownedById, query, rarity, training]);

  const mutate = (action: (state: GameState, cardId: string) => GameState) => {
    if (!selectedCard) return;
    try { onChange(action(game, selectedCard.id)); } catch { /* Guarded by the disabled states. */ }
  };

  return <section className="panel card-list-page">
    <div className="section-head"><div><p className="eyebrow">OWNED MEMBERS</p><h2>卡牌一览</h2></div><strong>{game.ownedCards.length} 张已拥有</strong></div>
    <p className="muted">这里只显示已拥有卡牌。测试阶段升级与特训暂不消耗材料；3★/4★完成特训后才能查看花后。</p>
    <div className="card-list-filters">
      <input aria-label="搜索已拥有卡牌" placeholder="搜索角色或中文卡名" value={query} onChange={(event) => setQuery(event.target.value)} />
      <select value={character} onChange={(event) => setCharacter(event.target.value)}><option value="all">全部角色</option>{characters.map((name) => <option key={name}>{name}</option>)}</select>
      <select value={rarity} onChange={(event) => setRarity(event.target.value === "all" ? "all" : Number(event.target.value) as CardRarity)}><option value="all">全部稀有度</option><option value="2">2★</option><option value="3">3★</option><option value="4">4★</option></select>
      <select value={attribute} onChange={(event) => setAttribute(event.target.value)}><option value="all">全部属性</option><option value="happy">happy</option><option value="cool">cool</option><option value="cute">cute</option><option value="pure">pure</option><option value="mysterious">mysterious</option></select>
      <select value={training} onChange={(event) => setTraining(event.target.value as TrainingFilter)}><option value="all">全部特训状态</option><option value="trained">已特训</option><option value="untrained">未特训</option></select>
    </div>
    <div className="collection-grid owned-card-grid">{cards.map((card) => { const owned = ownedById.get(card.id)!; return <button key={card.id} className="collection-card owned collection-card-button" onClick={() => setSelectedCardId(card.id)}><CardArt card={card} trained={Boolean(owned.trained)} /><div className="collection-meta"><small>{card.rarity}★ · Lv.{owned.level ?? 1} · {owned.trained ? "已特训" : "未特训"}</small><h3>{card.character}</h3><p>「{card.title}」</p><b>获得 ×{owned.count}</b></div></button>; })}</div>
    {cards.length === 0 && <div className="empty">没有符合筛选条件的已拥有卡牌。</div>}
    {selectedCard && selectedOwned && <CardDetailModal card={selectedCard} owned={selectedOwned} trainedUnlocked={Boolean(selectedOwned.trained)} onLevelUp={() => mutate(levelUpOwnedCard)} onTrain={() => mutate(trainOwnedCard)} onClose={() => setSelectedCardId(null)} />}
  </section>;
};

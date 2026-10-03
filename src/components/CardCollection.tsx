import { useMemo, useState } from "react";
import { cardPool } from "../data/defaults";
import { CardDefinition, GameState } from "../types/game";
import { CardArt } from "./CardArt";
import { CardDetailModal } from "./CardDetailModal";

export const CardCollection = ({ game }: { game: GameState }) => {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [detailCard, setDetailCard] = useState<CardDefinition | null>(null);
  const ownedById = useMemo(() => new Map(game.ownedCards.map((item) => [item.cardId, item])), [game.ownedCards]);
  const characters = useMemo(() => Array.from(new Set(cardPool.map((card) => card.character))), []);

  if (selectedCharacter) {
    const characterCards = cardPool.filter((card) => card.character === selectedCharacter);
    const ownedCount = characterCards.filter((card) => ownedById.has(card.id)).length;
    return <section className="panel member-collection">
      <div className="section-head"><div><button className="ghost back-button" onClick={() => setSelectedCharacter(null)}>← 返回角色</button><p className="eyebrow">CHARACTER MEMBERS</p><h2>{selectedCharacter} · 成员</h2></div><strong>{ownedCount} / {characterCards.length}</strong></div>
      <div className="collection-progress"><i style={{ width: `${characterCards.length ? ownedCount / characterCards.length * 100 : 0}%` }} /></div>
      <div className="collection-grid">
        {characterCards.map((card) => { const owned = ownedById.get(card.id); return owned
          ? <button key={card.id} className="collection-card owned collection-card-button" onClick={() => setDetailCard(card)}><CardArt card={card} trained={Boolean(owned.trained)} /><div className="collection-meta"><small>{card.rarity}★ · {owned.trained ? "已特训" : "未特训"}</small><h3>{card.title}</h3><p>获得 ×{owned.count}</p></div></button>
          : <article key={card.id} className="collection-card locked"><div className="locked-art"><span>?</span></div><div className="collection-meta"><small>{card.rarity}★ · 未获得</small><h3>{card.title}</h3></div></article>; })}
      </div>
      {detailCard && <CardDetailModal card={detailCard} owned={ownedById.get(detailCard.id)} trainedUnlocked={Boolean(ownedById.get(detailCard.id)?.trained)} onClose={() => setDetailCard(null)} />}
    </section>;
  }

  return <section className="panel member-collection">
    <div className="section-head"><div><p className="eyebrow">CARD COLLECTION</p><h2>卡牌图鉴</h2></div><strong>{game.ownedCards.length} / {cardPool.length}</strong></div>
    <p className="muted">按角色查看成员收集度。点击角色进入其成员图鉴，未获得卡牌仍会显示为锁定状态。</p>
    <div className="character-collection-grid">
      {characters.map((character) => {
        const cards = cardPool.filter((card) => card.character === character);
        const ownedCards = cards.filter((card) => ownedById.has(card.id));
        const cover = [...ownedCards].sort((a, b) => b.rarity - a.rarity)[0] ?? cards.find((card) => card.rarity === 4) ?? cards[0];
        const progress = cards.length ? Math.round(ownedCards.length / cards.length * 100) : 0;
        return <button key={character} className="character-collection-card" onClick={() => setSelectedCharacter(character)}>
          <div className={`character-cover ${ownedCards.length ? "" : "is-locked"}`}><CardArt card={cover} trained={Boolean(ownedById.get(cover.id)?.trained)} /></div>
          <div><h3>{character}</h3><p>{ownedCards.length} / {cards.length} · {progress}%</p><span><i style={{ width: `${progress}%` }} /></span></div>
        </button>;
      })}
    </div>
  </section>;
};

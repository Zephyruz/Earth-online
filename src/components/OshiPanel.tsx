import { useMemo } from "react";
import { cardPool } from "../data/defaults";
import { GameState } from "../types/game";
import { CardArt } from "./CardArt";

export const OshiPanel = ({ game, onChange }: { game: GameState; onChange: (character: string) => void }) => {
  const characters = useMemo(() => Array.from(new Set(cardPool.map((card) => card.character))), []);
  const focus = characters.includes(game.settings.focusCharacter ?? "") ? game.settings.focusCharacter! : "神代类";
  const cards = cardPool.filter((card) => card.character === focus);
  const ownedById = new Map(game.ownedCards.map((owned) => [owned.cardId, owned]));
  const ownedCards = cards.filter((card) => ownedById.has(card.id));
  const targetCard = cardPool.find((card) => card.id === game.settings.targetCardId);
  const targetOwned = targetCard ? ownedById.has(targetCard.id) : false;
  const cover = (targetCard?.character === focus ? targetCard : undefined)
    ?? [...ownedCards].sort((a, b) => (ownedById.get(b.id)?.lastObtainedAt ?? "").localeCompare(ownedById.get(a.id)?.lastObtainedAt ?? ""))[0]
    ?? cards.find((card) => card.featured)
    ?? cards.find((card) => card.rarity === 4)
    ?? cards[0];
  const owned = cover ? ownedById.get(cover.id) : undefined;
  const collection = cards.length ? Math.round(ownedCards.length / cards.length * 100) : 0;
  const tenPullProgress = Math.min(100, game.player.crystals / 3000 * 100);

  return <section className="panel oshi-panel">
    <div className="oshi-art">{cover && <CardArt card={cover} trained={Boolean(owned?.trained)} />}</div>
    <div className="oshi-copy">
      <p className="eyebrow">OSHI FOCUS</p>
      <label className="oshi-select">当前应援角色<select value={focus} onChange={(event) => onChange(event.target.value)}>{characters.map((character) => <option key={character}>{character}</option>)}</select></label>
      <div className="oshi-stats"><span><strong>{ownedCards.length}/{cards.length}</strong> 图鉴</span><span><strong>{collection}%</strong> 收集率</span></div>
      {targetCard && <div className={`target-member ${targetOwned ? "obtained" : ""}`}><span>{targetOwned ? "✓ 已获得目标" : "◎ 目标成员"}</span><strong>{targetCard.character}「{targetCard.title}」</strong></div>}
      <div className="pull-progress-copy"><span>下一次十连</span><strong>{game.player.crystals >= 3000 ? "已经准备好" : `还差 ${(3000 - game.player.crystals).toLocaleString()} 水晶`}</strong></div>
      <div className="daily-live-track pull-track"><i style={{ width: `${tenPullProgress}%` }} /></div>
    </div>
  </section>;
};

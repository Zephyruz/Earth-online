import { useEffect, useState } from "react";
import { CardDefinition, OwnedCard } from "../types/game";
import { baseMaxLevel, currentCardLevel, maxCardLevel } from "../utils/cardProgress";
import { CardArt } from "./CardArt";

interface Props {
  card: CardDefinition;
  onClose: () => void;
  owned?: OwnedCard;
  trainedUnlocked?: boolean;
  onLevelUp?: () => void;
  onTrain?: () => void;
}

export const CardDetailModal = ({ card, onClose, owned, trainedUnlocked = true, onLevelUp, onTrain }: Props) => {
  const [trained, setTrained] = useState(false);
  const level = owned ? currentCardLevel(owned) : 1;
  const levelCap = owned ? maxCardLevel(card, owned) : baseMaxLevel(card);
  const canTrain = Boolean(owned && card.rarity >= 3 && card.trainedImageUrl && !owned.trained && level >= baseMaxLevel(card));

  useEffect(() => setTrained(false), [card.id]);
  useEffect(() => { if (!trainedUnlocked && trained) setTrained(false); }, [trained, trainedUnlocked]);

  return <div className="modal-backdrop card-detail-backdrop" onMouseDown={onClose}>
    <div className="modal card-detail-modal" onMouseDown={(event) => event.stopPropagation()}>
      <button className="card-detail-close ghost" onClick={onClose} aria-label="关闭卡牌详情">×</button>
      <div className={`card-detail-art ${trained ? "show-trained" : "show-normal"}`}>
        <CardArt card={card} trained={trained} />
      </div>
      <div className="card-detail-copy">
        <p className="eyebrow">MEMBER DETAIL</p>
        <h2>{card.character}</h2>
        <p>「{card.title}」</p>
        <div className="card-detail-tags"><span>{card.rarity}★</span><span>{card.attribute}</span>{card.limited && <span>限定</span>}</div>
        {card.trainedImageUrl && <div className="art-toggle" role="group" aria-label="切换卡面">
          <button className={trained ? "ghost" : ""} onClick={() => setTrained(false)}>花前</button>
          <button className={trained ? "" : "ghost"} disabled={!trainedUnlocked} onClick={() => setTrained(true)}>花后{!trainedUnlocked ? " · 未解锁" : ""}</button>
        </div>}
        {card.trainedImageUrl && !trainedUnlocked && <small className="training-hint">请在“卡牌一览”升满等级并完成特训后查看花后。</small>}
        {owned && <div className="card-training-panel">
          <div><span>等级</span><strong>Lv.{level} / {levelCap}</strong></div>
          <div className="training-progress"><i style={{ width: `${Math.min(100, level / levelCap * 100)}%` }} /></div>
          <p>获得次数 ×{owned.count} · {owned.trained ? "已完成特训" : card.rarity >= 3 ? "尚未特训" : "无特训"}</p>
          <div className="card-actions">
            {onLevelUp && <button disabled={level >= levelCap} onClick={onLevelUp}>提升 10 级</button>}
            {onTrain && card.rarity >= 3 && !owned.trained && <button className={canTrain ? "" : "ghost"} disabled={!canTrain} onClick={onTrain}>完成特训</button>}
          </div>
        </div>}
      </div>
    </div>
  </div>;
};

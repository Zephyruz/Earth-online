import { useState } from "react";
import { CardDefinition } from "../types/game";

export const CardArt = ({ card, trained = true }: { card: CardDefinition; trained?: boolean }) => {
  const [failed, setFailed] = useState(false);
  const src = trained && card.trainedImageUrl ? card.trainedImageUrl : card.imageUrl;
  return <div className={`card-art rarity-${card.rarity}star ${failed ? "art-fallback" : ""}`}>
    {!failed && <img src={src} alt={`${card.character}「${card.title}」`} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />}
    {failed && <div><strong>{card.rarity}★</strong><span>{card.character}</span><small>{card.title}</small></div>}
    <span className="star-rank">{"★".repeat(card.rarity)}</span>
    {card.limited && <span className="limited-mark">限定</span>}
  </div>;
};

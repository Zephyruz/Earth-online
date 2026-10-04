import { useEffect, useMemo, useState } from "react";
import { cardPool } from "../data/defaults";
import { CardDefinition, CardPull, CardRarity } from "../types/game";
import { playGachaRevealSound, stopGachaMusic } from "../utils/gachaAudio";
import { CardArt } from "./CardArt";
import { CardDetailModal } from "./CardDetailModal";

interface Props { results: CardPull[]; animations: boolean; canRepeatTen: boolean; onRepeatTen: () => void; onClose: () => void; }
type RevealPhase = "omen" | "transition" | "notes" | "reveal" | "summary";

const rarityLabel: Record<CardRarity, string> = { 2: "蓝色微光", 3: "金色预兆", 4: "虹彩预兆" };

export const GachaResultModal = ({ results, animations, canRepeatTen, onRepeatTen, onClose }: Props) => {
  const cards = useMemo(() => results.map((result) => ({
    result,
    card: cardPool.find((item) => item.id === result.cardId) as CardDefinition,
  })), [results]);
  const highestRarity = Math.max(2, ...results.map((item) => item.rarity)) as CardRarity;
  const signature = results.reduce((total, item, index) => {
    const sourceId = cardPool.find((card) => card.id === item.cardId)?.sourceId ?? index;
    return total + sourceId * (index + 1);
  }, 0);
  const surpriseUpgrade = highestRarity === 4 && signature % 3 === 0;
  const openingRarity: CardRarity = surpriseUpgrade ? 3 : highestRarity;
  const [phase, setPhase] = useState<RevealPhase>(animations ? "omen" : "summary");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [highRarityOnly, setHighRarityOnly] = useState(false);
  const [showCutIn, setShowCutIn] = useState(false);
  const [detailCard, setDetailCard] = useState<CardDefinition | null>(null);

  useEffect(() => {
    cards.forEach(({ card }) => {
      [card.imageUrl, card.trainedImageUrl].filter(Boolean).forEach((source) => {
        const image = new Image();
        image.referrerPolicy = "no-referrer";
        image.src = source as string;
      });
    });
  }, [cards]);

  useEffect(() => () => stopGachaMusic(), []);

  useEffect(() => {
    if (phase !== "transition") return;
    const timer = window.setTimeout(() => setPhase("notes"), 1650);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const current = cards[currentIndex];
  const hasNextReveal = highRarityOnly
    ? cards.some(({ result }, index) => index > currentIndex && result.rarity >= 3)
    : currentIndex < cards.length - 1;

  useEffect(() => {
    if (phase !== "reveal" || !current) { setShowCutIn(false); return; }
    playGachaRevealSound(current.result.rarity);
    if (current.result.rarity < 3) { setShowCutIn(false); return; }
    setShowCutIn(true);
    const timer = window.setTimeout(() => setShowCutIn(false), current.result.rarity === 4 ? 1500 : 1200);
    return () => window.clearTimeout(timer);
  }, [currentIndex, phase]);

  const beginReveal = () => { setHighRarityOnly(false); setCurrentIndex(0); setPhase("reveal"); };
  const showHighRarity = () => {
    const startAt = phase === "reveal" ? currentIndex + 1 : 0;
    const nextIndex = cards.findIndex(({ result }, index) => index >= startAt && result.rarity >= 3);
    if (nextIndex < 0) { setPhase("summary"); return; }
    setHighRarityOnly(true);
    setCurrentIndex(nextIndex);
    setPhase("reveal");
  };
  const revealNext = () => {
    const nextIndex = highRarityOnly
      ? cards.findIndex(({ result }, index) => index > currentIndex && result.rarity >= 3)
      : currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= cards.length) { setPhase("summary"); return; }
    setCurrentIndex(nextIndex);
  };

  const closeResults = () => { stopGachaMusic(); onClose(); };

  return <div className="modal-backdrop gacha-backdrop" role="dialog" aria-modal="true" aria-label="招募演出">
    <div className={`modal gacha-cinematic phase-${phase} rarity-scene-${openingRarity} ${surpriseUpgrade ? "surprise-upgrade" : ""}`}>
      {phase !== "summary" && <div className="gacha-skip-actions">
        <button className="ghost" onClick={showHighRarity}>只看 3★/4★</button>
        <button className="ghost" onClick={() => setPhase("summary")}>直接看结果</button>
      </div>}

      {(phase === "omen" || phase === "transition") && <button className="omen-stage" onClick={phase === "omen" ? () => setPhase("transition") : undefined} aria-label="轻触水晶继续">
        <div className="stage-haze haze-one" /><div className="stage-haze haze-two" />
        <div className="music-staff" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <div className="summon-portal" aria-hidden="true"><i /><i /><i /><span className="orbit-note orbit-one">♪</span><span className="orbit-note orbit-two">♫</span><span className="orbit-note orbit-three">♪</span></div>
        <div className="prism-field" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
        <div className={`crystal-orb omen-${openingRarity}`} aria-hidden="true"><span className="orb-ring ring-one" /><span className="orb-ring ring-two" /><strong>♪</strong></div>
        <div className="ground-ripple" aria-hidden="true"><i /><i /><i /></div>
        <div className="omen-copy"><span>{phase === "transition" && surpriseUpgrade ? "光芒正在改变……" : rarityLabel[openingRarity]}</span><strong>{phase === "omen" ? "轻触水晶" : "演出开始"}</strong></div>
      </button>}

      {phase === "notes" && <button className="notes-stage" onClick={beginReveal} aria-label="开始逐张揭晓">
        <p className="eyebrow">RECRUIT NOTES</p>
        <h2>{surpriseUpgrade ? "金色光芒，升格为虹彩！" : highestRarity === 4 ? "虹彩回应了你的愿望" : highestRarity === 3 ? "金色音符正在共鸣" : "音符已经汇聚"}</h2>
        <div className="note-lane" aria-hidden="true">{cards.map(({ result }, index) => <span key={index} className={`pull-note note-${result.rarity}`} style={{ animationDelay: `${index * 85}ms` }}><i>♪</i></span>)}</div>
        <strong className="tap-hint">轻触，逐张揭晓</strong>
      </button>}

      {phase === "reveal" && current && <div className={`single-reveal-stage rarity-reveal-${current.result.rarity} is-face-up`}>
        <button className="reveal-tap-layer" onClick={showCutIn ? () => setShowCutIn(false) : revealNext} aria-label={showCutIn ? "跳过成员台词" : hasNextReveal ? "查看下一张卡牌" : "查看招募结果"} />
        <div className="reveal-counter"><b>{currentIndex + 1}</b><span>/ {cards.length}</span></div><div className="reveal-rays" aria-hidden="true" />
        {showCutIn ? <div className={`member-cutin cutin-${current.result.rarity}`} key={`cutin-${current.card.id}-${currentIndex}`}>
          <div className="cutin-lines" aria-hidden="true"><i /><i /><i /></div>
          <div className="cutin-note" aria-hidden="true">♪</div>
          <p>{current.result.rarity === 4 ? "4★ MEMBER" : "3★ MEMBER"}</p>
          <h2>{current.card.character}</h2>
          <blockquote>「{current.card.gachaPhrase ?? "新的旋律，正在这里响起。"}」</blockquote>
          <small>轻触跳过</small>
        </div> : <>
          <div className="card-arrival-shell" key={`${current.card.id}-${currentIndex}`}>
            <div className="arriving-card"><CardArt card={current.card} trained={false} /></div>
          </div>
          <div className="single-card-copy"><small>{current.result.isNew ? "NEW MEMBER" : `${current.result.rarity}★ MEMBER`}</small><strong>{current.card.character}</strong><span>「{current.card.title}」</span>{!current.result.isNew && <b>重复成员 · 心愿碎片 +{current.result.wishPieces ?? 0}</b>}<em>{hasNextReveal ? highRarityOnly ? "轻触查看下一张高稀有卡" : "轻触查看下一张" : "轻触查看招募结果"}</em></div>
        </>}
      </div>}

      {phase === "summary" && <div className="gacha-summary">
        <div className="section-head"><div><p className="eyebrow">RECRUIT RESULT</p><h3>招募结果</h3></div><span>{results.filter((item) => item.isNew).length} 张新卡</span></div>
        <div className="gacha-summary-grid">{cards.map(({ result, card }, index) => <button key={`${result.cardId}-${index}`} className={`result-card rarity-result-${result.rarity}`} onClick={() => setDetailCard(card)}><CardArt card={card} trained={false} /><div><b>{result.isNew ? "NEW" : `碎片 +${result.wishPieces ?? 0}`}</b><strong>{card.character}</strong><small>「{card.title}」</small><em>点击查看卡面</em></div></button>)}</div>
        <div className="modal-actions">{results.length === 10 && <button className="ghost" disabled={!canRepeatTen} onClick={() => { stopGachaMusic(); onRepeatTen(); }}>再来 10 发 · 3000</button>}<button onClick={closeResults}>收下卡牌</button></div>
      </div>}
      {detailCard && <CardDetailModal card={detailCard} onClose={() => setDetailCard(null)} />}
    </div>
  </div>;
};

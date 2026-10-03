import { activeBanner, cardPool } from "../data/defaults";
import { GameState } from "../types/game";
import { CardArt } from "./CardArt";

interface Props { game: GameState; onDraw: (count: 1 | 10) => void; onVoucher: () => void; onExchange: (cardId: string) => void; }

export const GachaPanel = ({ game, onDraw, onVoucher, onExchange }: Props) => {
  const stickers = game.bannerStickers[activeBanner.id] ?? 0;
  const featuredCards = cardPool.filter((card) => card.featured);
  const heroCard = cardPool.find((card) => card.sourceId === 672) ?? featuredCards[0];
  return <section className="panel gacha-page">
    <div className="banner-hero">
      <div className="banner-copy"><p className="eyebrow">JAPANESE SERVER · COLORFUL FESTIVAL</p><h2>{activeBanner.name}</h2><h3>{activeBanner.subtitle}</h3><p>四星概率提升至 6%。神代类「为内心，拍一张」与百鬼夜行限定成员先行登场。</p><div className="resource-row"><span>◇ 水晶 {game.player.crystals.toLocaleString()}</span><span>贴纸 {stickers}</span><span>限定招募券 {game.player.limitedVouchers}</span></div><div className="card-actions"><button disabled={game.player.crystals < 300} onClick={() => onDraw(1)}>招募 1 次 · 300</button><button className="ten-pull" disabled={game.player.crystals < 3000} onClick={() => onDraw(10)}>招募 10 次 · 3000</button></div><small>点击招募后需要再次确认。十连至少获得一张 3★ 或以上。</small></div>
      <CardArt card={heroCard} />
    </div>
    <div className="probability"><span>2★ 85.5%</span><span>3★ 8.5%</span><span>4★ 6%</span><span>每次招募获得贴纸 ×1</span></div>
    <div className="section-head"><div><h3>本期主要成员</h3><p className="muted">完整招募范围 459 张：2★ 105 张、3★ 103 张、4★ 251 张。当期五张四星各占 0.4%。</p></div></div>
    <div className="featured-strip">{featuredCards.map((card) => <article key={card.id}><CardArt card={card} /><h4>{card.character}</h4><p>「{card.title}」</p><button className="ghost" onClick={() => onExchange(card.id)}>兑换这张卡</button></article>)}</div>
    <div className="exchange-panel"><div><h3>贴纸兑换所</h3><p>指定四星：300 枚贴纸，或 200 枚贴纸＋10 张限定招募券。</p><p>招募券：10 枚贴纸兑换 1 张，本期最多兑换 10 张；招募券不会随卡池结束失效。</p></div><button disabled={stickers < 10 || (game.bannerVoucherExchanges[activeBanner.id] ?? 0) >= 10} onClick={onVoucher}>兑换招募券<br /><small>{game.bannerVoucherExchanges[activeBanner.id] ?? 0} / 10</small></button></div>
  </section>;
};

import { attributeLabels } from "../data/defaults";
import { Player } from "../types/game";
import { requiredExp } from "../utils/math";
import { AttributeBar } from "./AttributeBar";

export const PlayerCard = ({ player }: { player: Player }) => (
  <section className="panel player-card">
    <div className="avatar" aria-hidden="true">旅</div>
    <div>
      <p className="eyebrow">{player.title}</p>
      <h2>{player.name}</h2>
      <p>{player.chapter}</p>
      <div className="resource-row">
        <span>Lv.{player.level}</span>
        <span>EXP {player.exp}/{requiredExp(player.level)}</span>
        <span>水晶 {player.crystals.toLocaleString()}</span>
        <span>限定券 {player.limitedVouchers}</span>
      </div>
      <div className="bar exp"><span style={{ width: `${Math.min(100, (player.exp / requiredExp(player.level)) * 100)}%` }} /></div>
    </div>
    <div className="attribute-grid">
      {Object.entries(player.attributes).map(([key, value]) => (
        <AttributeBar key={key} label={attributeLabels[key as keyof typeof attributeLabels]} value={value} />
      ))}
    </div>
  </section>
);

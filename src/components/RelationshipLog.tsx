import { Interaction } from "../types/game";
import { formatDate } from "../utils/date";

export const RelationshipLog = ({ interactions }: { interactions: Interaction[] }) => (
  <div className="timeline compact">
    {interactions.map((item) => (
      <div key={item.id}>
        <strong>{item.title}</strong>
        <span>{formatDate(item.date)}</span>
        <p>{item.note || "没有额外备注。"}</p>
        <small>好感 {item.favorabilityChange} · 熟悉 {item.familiarityChange} · 稳定 {item.stabilityChange}</small>
      </div>
    ))}
    {interactions.length === 0 && <p>还没有互动记录。</p>}
  </div>
);

import { Character } from "../types/game";
import { formatDate } from "../utils/date";

export const CharacterCard = ({ character, onOpen }: { character: Character; onOpen: () => void }) => (
  <article className="character-card" onClick={onOpen}>
    <div className="avatar small" style={{ background: character.avatar }}>{character.name.slice(0, 1)}</div>
    <div>
      <div className="card-title-row">
        <h3>{character.name}</h3>
        <span className="badge">{character.relationshipType}</span>
      </div>
      <div className="bar"><span style={{ width: `${character.favorability}%` }} /></div>
      <p>熟悉 {character.familiarity} · 稳定 {character.stability}</p>
      <small>最近互动：{formatDate(character.lastInteractionAt)}</small>
    </div>
  </article>
);

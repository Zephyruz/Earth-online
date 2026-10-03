import { useState } from "react";
import { Character, Interaction } from "../types/game";
import { nowIso } from "../utils/date";
import { clamp, uid } from "../utils/math";
import { RelationshipLog } from "./RelationshipLog";

interface Props {
  character?: Character;
  interactions: Interaction[];
  onClose: () => void;
  onSave: (character: Character) => void;
  onDelete?: (id: string) => void;
  onInteract?: (interaction: Interaction) => void;
}

const relationshipTypes = ["家人", "朋友", "好友", "同学", "同事", "室友", "搭子", "暧昧", "恋人", "低频联系", "特殊关系", "自定义"];

const avatarOptions = [
  { name: "晨樱", value: "linear-gradient(135deg, #ff9fca, #ffd6e8)" },
  { name: "晴空", value: "linear-gradient(135deg, #79c7ff, #c7f0ff)" },
  { name: "薄荷", value: "linear-gradient(135deg, #63dfbd, #d7fff1)" },
  { name: "葡萄", value: "linear-gradient(135deg, #9d7cff, #ffd1ff)" },
  { name: "奶橙", value: "linear-gradient(135deg, #ffb86b, #fff0b8)" },
  { name: "星夜", value: "linear-gradient(135deg, #5661d8, #9ed8ff)" },
  { name: "玫瑰", value: "linear-gradient(135deg, #ff6f91, #ffb6b9)" },
  { name: "森林", value: "linear-gradient(135deg, #2fb36d, #b7f8c8)" }
];

export const CharacterDetailModal = ({ character, interactions, onClose, onSave, onDelete, onInteract }: Props) => {
  const [draft, setDraft] = useState<Character>(() => character ?? {
    id: uid("char"),
    name: "",
    nickname: "",
    avatar: avatarOptions[0].value,
    relationshipType: "朋友",
    favorability: 50,
    familiarity: 30,
    stability: 50,
    notes: "",
    tags: [],
    createdAt: nowIso()
  });
  const [interaction, setInteraction] = useState({ title: "聊天", note: "", favorabilityChange: 2, familiarityChange: 2, stabilityChange: 0 });
  const [error, setError] = useState("");

  const save = () => {
    if (!draft.name.trim()) {
      setError("人物姓名不能为空。");
      return;
    }
    onSave({
      ...draft,
      name: draft.name.trim(),
      favorability: clamp(draft.favorability),
      familiarity: clamp(draft.familiarity),
      stability: clamp(draft.stability)
    });
  };

  const addInteraction = () => {
    if (!character || !onInteract || !interaction.title.trim()) return;
    onInteract({
      id: uid("int"),
      characterId: character.id,
      title: interaction.title.trim(),
      note: interaction.note,
      date: nowIso(),
      favorabilityChange: interaction.favorabilityChange,
      familiarityChange: interaction.familiarityChange,
      stabilityChange: interaction.stabilityChange
    });
    setInteraction({ title: "聊天", note: "", favorabilityChange: 2, familiarityChange: 2, stabilityChange: 0 });
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal wide" onMouseDown={(event) => event.stopPropagation()}>
        <h3>{character ? "人物详情" : "新增人物"}</h3>
        <div className="form-grid">
          <label>姓名<input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
          <label>昵称<input value={draft.nickname ?? ""} onChange={(e) => setDraft({ ...draft, nickname: e.target.value })} /></label>
          <label>关系<select value={draft.relationshipType} onChange={(e) => setDraft({ ...draft, relationshipType: e.target.value })}>{relationshipTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
          <label>好感<input type="number" value={draft.favorability} onChange={(e) => setDraft({ ...draft, favorability: Number(e.target.value) })} /></label>
          <label>熟悉<input type="number" value={draft.familiarity} onChange={(e) => setDraft({ ...draft, familiarity: Number(e.target.value) })} /></label>
          <label>稳定<input type="number" value={draft.stability} onChange={(e) => setDraft({ ...draft, stability: Number(e.target.value) })} /></label>
          <label>标签<input value={draft.tags.join(",")} onChange={(e) => setDraft({ ...draft, tags: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} /></label>
        </div>
        <div className="avatar-picker">
          <div>
            <span className="field-label">头像颜色</span>
            <p>选择一个头像色板，不需要手动输入颜色参数。</p>
          </div>
          <div className="avatar-options">
            {avatarOptions.map((option) => (
              <button
                key={option.name}
                type="button"
                className={draft.avatar === option.value ? "selected" : ""}
                onClick={() => setDraft({ ...draft, avatar: option.value })}
                title={option.name}
              >
                <span style={{ background: option.value }} />
                {option.name}
              </button>
            ))}
          </div>
        </div>
        <label>备注<textarea value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /></label>
        {character && (
          <section className="subpanel">
            <h4>添加互动</h4>
            <div className="form-grid">
              <label>标题<input value={interaction.title} onChange={(e) => setInteraction({ ...interaction, title: e.target.value })} /></label>
              <label>好感变化<input type="number" value={interaction.favorabilityChange} onChange={(e) => setInteraction({ ...interaction, favorabilityChange: Number(e.target.value) })} /></label>
              <label>熟悉变化<input type="number" value={interaction.familiarityChange} onChange={(e) => setInteraction({ ...interaction, familiarityChange: Number(e.target.value) })} /></label>
              <label>稳定变化<input type="number" value={interaction.stabilityChange} onChange={(e) => setInteraction({ ...interaction, stabilityChange: Number(e.target.value) })} /></label>
            </div>
            <label>记录<textarea value={interaction.note} onChange={(e) => setInteraction({ ...interaction, note: e.target.value })} /></label>
            <button className="ghost" onClick={addInteraction}>记录互动</button>
            <RelationshipLog interactions={interactions} />
          </section>
        )}
        {error && <p className="error">{error}</p>}
        <div className="modal-actions">
          {character && onDelete && <button className="ghost danger-text" onClick={() => onDelete(character.id)}>删除人物</button>}
          <button className="ghost" onClick={onClose}>关闭</button>
          <button onClick={save}>保存</button>
        </div>
      </div>
    </div>
  );
};

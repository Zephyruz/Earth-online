import { useState } from "react";
import { AttributeKey, Task, TaskType } from "../types/game";
import { uid } from "../utils/math";
import { nowIso } from "../utils/date";

interface Props {
  task?: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const attributes: AttributeKey[] = ["energy", "mood", "discipline", "social", "study", "health"];

export const AddTaskModal = ({ task, onClose, onSave }: Props) => {
  const [draft, setDraft] = useState<Task>(() => task ?? {
    id: uid("task"),
    title: "",
    description: "",
    type: "daily",
    completed: false,
    createdAt: nowIso(),
    crystalReward: 150,
    expReward: 10,
    attributeRewards: {},
    difficulty: "normal"
  });
  const [error, setError] = useState("");

  const save = () => {
    if (!draft.title.trim()) {
      setError("任务标题不能为空。");
      return;
    }
    onSave({ ...draft, title: draft.title.trim() });
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal wide" onMouseDown={(event) => event.stopPropagation()}>
        <h3>{task ? "编辑任务" : "新增任务"}</h3>
        <label>标题<input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
        <label>描述<textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label>
        <div className="form-grid">
          <label>类型<select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as TaskType })}>
            <option value="daily">每日</option><option value="weekly">每周</option><option value="main">主线</option><option value="side">支线</option>
          </select></label>
          <label>难度<select value={draft.difficulty} onChange={(e) => setDraft({ ...draft, difficulty: e.target.value as Task["difficulty"] })}>
            <option value="easy">easy</option><option value="normal">normal</option><option value="hard">hard</option>
          </select></label>
          <label>水晶<input type="number" value={draft.crystalReward} onChange={(e) => setDraft({ ...draft, crystalReward: Math.max(0, Number(e.target.value)) })} /></label>
          <label>经验<input type="number" value={draft.expReward} onChange={(e) => setDraft({ ...draft, expReward: Math.max(0, Number(e.target.value)) })} /></label>
          <label>目标进度<input type="number" value={draft.target ?? 0} onChange={(e) => setDraft({ ...draft, target: Number(e.target.value) || undefined, progress: 0 })} /></label>
        </div>
        <p className="eyebrow">属性奖励</p>
        <div className="form-grid">
          {attributes.map((key) => (
            <label key={key}>{key}<input type="number" value={draft.attributeRewards[key] ?? 0} onChange={(e) => setDraft({ ...draft, attributeRewards: { ...draft.attributeRewards, [key]: Number(e.target.value) } })} /></label>
          ))}
        </div>
        {error && <p className="error">{error}</p>}
        <div className="modal-actions">
          <button className="ghost" onClick={onClose}>取消</button>
          <button onClick={save}>保存</button>
        </div>
      </div>
    </div>
  );
};

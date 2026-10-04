import { useState } from "react";
import { AttributeKey, Task, TaskType } from "../types/game";
import { uid } from "../utils/math";
import { nowIso } from "../utils/date";
import { attributeLabels, taskRewardPreset } from "../data/defaults";

interface Props {
  task?: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const attributes: AttributeKey[] = ["energy", "mood", "discipline", "social", "study", "health"];

export const AddTaskModal = ({ task, onClose, onSave }: Props) => {
  const initialRewards = taskRewardPreset("daily", "normal");
  const [draft, setDraft] = useState<Task>(() => task ?? {
    id: uid("task"),
    title: "",
    description: "",
    type: "daily",
    completed: false,
    createdAt: nowIso(),
    ...initialRewards,
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

  const applyRecommendedRewards = () => {
    const rewards = taskRewardPreset(draft.type, draft.difficulty, draft.target);
    setDraft({ ...draft, ...rewards });
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal wide" onMouseDown={(event) => event.stopPropagation()}>
        <h3>{task ? "编辑任务" : "新增任务"}</h3>
        <label>标题<input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
        <label>描述<textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label>
        <div className="form-grid task-basics-grid">
          <label>类型<select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as TaskType })}>
            <option value="daily">每日</option><option value="weekly">每周</option><option value="main">主线</option><option value="side">支线</option>
          </select></label>
          <label>难度<select value={draft.difficulty} onChange={(e) => setDraft({ ...draft, difficulty: e.target.value as Task["difficulty"] })}>
            <option value="easy">轻量</option><option value="normal">标准</option><option value="hard">挑战</option>
          </select></label>
          <label>目标次数<input type="number" min="0" value={draft.target ?? 0} onChange={(e) => { const target = Number(e.target.value) || undefined; setDraft({ ...draft, target, progress: target ? Math.min(draft.progress ?? 0, target) : undefined }); }} /></label>
        </div>
        <div className="reward-editor-head"><div><p className="eyebrow">QUEST REWARDS</p><strong>任务奖励</strong></div><button className="ghost" type="button" onClick={applyRecommendedRewards}>按类型与难度推荐</button></div>
        <div className="form-grid reward-form-grid">
          <label>水晶<input type="number" value={draft.crystalReward} onChange={(e) => setDraft({ ...draft, crystalReward: Math.max(0, Number(e.target.value)) })} /></label>
          <label>经验<input type="number" value={draft.expReward} onChange={(e) => setDraft({ ...draft, expReward: Math.max(0, Number(e.target.value)) })} /></label>
          <label>练习乐谱<input type="number" value={draft.practiceReward} onChange={(e) => setDraft({ ...draft, practiceReward: Math.max(0, Number(e.target.value)) })} /></label>
          <label>奇迹结晶<input type="number" value={draft.miracleGemReward} onChange={(e) => setDraft({ ...draft, miracleGemReward: Math.max(0, Number(e.target.value)) })} /></label>
        </div>
        <p className="eyebrow">属性奖励</p>
        <div className="form-grid">
          {attributes.map((key) => (
            <label key={key}>{attributeLabels[key]}<input type="number" value={draft.attributeRewards[key] ?? 0} onChange={(e) => setDraft({ ...draft, attributeRewards: { ...draft.attributeRewards, [key]: Number(e.target.value) } })} /></label>
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

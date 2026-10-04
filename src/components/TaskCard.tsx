import { attributeLabels, taskTypeLabels } from "../data/defaults";
import { Task } from "../types/game";

interface Props {
  task: Task;
  onComplete: (id: string) => void;
  onAdvance: (id: string) => void;
  onUndo: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const difficultyLabels = { easy: "轻量", normal: "标准", hard: "挑战" } as const;

export const TaskCard = ({ task, onComplete, onAdvance, onUndo, onEdit, onDelete }: Props) => (
  <article className={`task-card difficulty-${task.difficulty} ${task.completed ? "done" : ""}`}>
    <div>
      <div className="card-title-row">
        <h3>{task.title}</h3>
        <span className={`badge ${task.type}`}>{taskTypeLabels[task.type]}</span>
      </div>
      {task.description && <p>{task.description}</p>}
      {task.target && <div className="task-progress"><div><span>进度</span><strong>{task.progress ?? 0} / {task.target}</strong></div><div className="bar"><span style={{ width: `${((task.progress ?? 0) / task.target) * 100}%` }} /></div></div>}
      <div className="chips">
        <span>{difficultyLabels[task.difficulty]}</span>
        <span>水晶 +{task.crystalReward}</span>
        <span>乐谱 +{task.practiceReward}</span>
        {task.miracleGemReward > 0 && <span>结晶 +{task.miracleGemReward}</span>}
        <span>EXP +{task.expReward}</span>
        {Object.entries(task.attributeRewards).filter(([, value]) => Boolean(value)).map(([key, value]) => (
          <span key={key}>{attributeLabels[key as keyof typeof attributeLabels]} +{value}</span>
        ))}
      </div>
    </div>
    <div className="card-actions">
      {task.completed ? <button className="ghost" onClick={() => onUndo(task.id)}>撤销</button> : task.target ? <button onClick={() => onAdvance(task.id)}>推进 +1</button> : <button onClick={() => onComplete(task.id)}>完成</button>}
      <button className="ghost" onClick={() => onEdit(task)}>编辑</button>
      <button className="ghost danger-text" onClick={() => onDelete(task.id)}>删除</button>
    </div>
  </article>
);

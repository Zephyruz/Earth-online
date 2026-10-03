import { Task } from "../types/game";
import { TaskCard } from "./TaskCard";

interface Props {
  tasks: Task[];
  onComplete: (id: string) => void;
  onUndo: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskList = ({ tasks, onComplete, onUndo, onEdit, onDelete }: Props) => (
  <div className="list">
    {tasks.map((task) => <TaskCard key={task.id} task={task} onComplete={onComplete} onUndo={onUndo} onEdit={onEdit} onDelete={onDelete} />)}
    {tasks.length === 0 && <div className="empty panel">这里暂时没有任务。休息也是正常行动。</div>}
  </div>
);

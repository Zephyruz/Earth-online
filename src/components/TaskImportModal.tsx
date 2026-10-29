import { ChangeEvent, useState } from "react";
import { taskRewardPreset } from "../data/defaults";
import { Difficulty, Task, TaskCategory, TaskType } from "../types/game";
import { nowIso } from "../utils/date";
import { uid } from "../utils/math";

const types = new Set<TaskType>(["daily", "weekly", "main", "side"]);
const categories = new Set<TaskCategory>(["work", "study", "health", "home", "social", "personal", "creative", "admin"]);
const difficulties = new Set<Difficulty>(["easy", "normal", "hard"]);

const parseTasks = (text: string): Task[] => text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
  const separator = line.includes("|") ? "|" : line.includes("\t") ? "\t" : ",";
  const [title, rawType, rawCategory, rawDifficulty, deadline, description, ...tagParts] = line.split(separator).map((part) => part?.trim() ?? "");
  const rawTags = tagParts.join(",");
  if (!title) throw new Error("存在空标题");
  const type = types.has(rawType as TaskType) ? rawType as TaskType : "side";
  const category = categories.has(rawCategory as TaskCategory) ? rawCategory as TaskCategory : "personal";
  const difficulty = difficulties.has(rawDifficulty as Difficulty) ? rawDifficulty as Difficulty : "normal";
  return { id: uid("task"), title, description, type, category, tags: rawTags ? rawTags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean) : [], completed: false, createdAt: nowIso(), deadline: deadline || undefined, ...taskRewardPreset(type, difficulty), attributeRewards: {}, difficulty };
});

export const TaskImportModal = ({ onClose, onImport }: { onClose: () => void; onImport: (tasks: Task[]) => void }) => {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const readFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setText(await file.text());
    event.target.value = "";
  };
  const submit = () => {
    try {
      const tasks = parseTasks(text);
      if (!tasks.length) throw new Error("请至少输入一个任务");
      onImport(tasks);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "导入失败"); }
  };
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal wide" onMouseDown={(event) => event.stopPropagation()}>
    <h3>批量导入任务</h3>
    <p>每行一个任务，用竖线分隔。只写标题也可以，其余内容会自动补齐。</p>
    <code>标题 | daily/weekly/main/side | work/study/health/home/social/personal/creative/admin | easy/normal/hard | 2026-11-01 | 描述 | 标签1,标签2</code>
    <textarea className="import-textarea" value={text} onChange={(event) => setText(event.target.value)} placeholder={"写周报 | weekly | work | normal | 2026-11-01 | 整理本周进度 | 工作,复盘\n读完一本书 | side | study | easy"} />
    <div className="card-actions"><label className="file-button">读取 TXT/CSV<input type="file" accept=".txt,.csv,text/plain,text/csv" onChange={readFile} /></label></div>
    {error && <p className="error">{error}</p>}
    <div className="modal-actions"><button className="ghost" onClick={onClose}>取消</button><button onClick={submit}>导入任务</button></div>
  </div></div>;
};

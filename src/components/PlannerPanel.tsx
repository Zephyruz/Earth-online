import { useMemo, useState } from "react";
import { PlannerEntry, PlannerKind, PlannerStatus } from "../types/game";
import { nowIso, todayKey } from "../utils/date";
import { uid } from "../utils/math";

const kindLabels: Record<PlannerKind, string> = { plan: "计划", book: "书", movie: "电影", series: "剧集", game: "游戏", other: "其他" };
const statusLabels: Record<PlannerStatus, string> = { wishlist: "想做/想看", in_progress: "进行中", completed: "已完成" };

export const PlannerPanel = ({ entries, onChange }: { entries: PlannerEntry[]; onChange: (entries: PlannerEntry[]) => void }) => {
  const [title, setTitle] = useState(""); const [kind, setKind] = useState<PlannerKind>("plan"); const [filter, setFilter] = useState<"all" | PlannerKind>("all");
  const visible = useMemo(() => entries.filter((entry) => filter === "all" || entry.kind === filter).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [entries, filter]);
  const add = () => { if (!title.trim()) return; onChange([{ id: uid("planner"), title: title.trim(), kind, status: "wishlist", notes: "", tags: [], createdAt: nowIso() }, ...entries]); setTitle(""); };
  const patch = (id: string, next: Partial<PlannerEntry>) => onChange(entries.map((entry) => entry.id === id ? { ...entry, ...next } : entry));
  return <section className="panel planner-panel">
    <div className="section-head"><div><p className="eyebrow">LIFE ARCHIVE</p><h2>计划本与生活收藏</h2><p>不要求每天打卡。想起时记一笔，完成时留下日期就够了。</p></div></div>
    <div className="planner-add"><input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="想做的计划、想读的书、看过的电影……" /><select value={kind} onChange={(e) => setKind(e.target.value as PlannerKind)}>{Object.entries(kindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button onClick={add}>记下来</button></div>
    <div className="filters"><select value={filter} onChange={(e) => setFilter(e.target.value as "all" | PlannerKind)}><option value="all">全部收藏</option>{Object.entries(kindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><span>{entries.filter((entry) => entry.status === "completed").length} 项已完成 · {entries.length} 项记录</span></div>
    <div className="planner-grid">{visible.map((entry) => <article className="subpanel planner-entry" key={entry.id}>
      <div className="section-head"><span className="planner-kind">{kindLabels[entry.kind]}</span><button className="ghost danger-text" onClick={() => onChange(entries.filter((item) => item.id !== entry.id))}>删除</button></div>
      <input className="planner-title" value={entry.title} onChange={(e) => patch(entry.id, { title: e.target.value })} />
      <div className="form-grid"><label>状态<select value={entry.status} onChange={(e) => { const status = e.target.value as PlannerStatus; patch(entry.id, { status, completedAt: status === "completed" ? entry.completedAt ?? todayKey() : undefined }); }}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>{entry.status === "completed" ? "完成/观看日期" : "计划日期"}<input type="date" value={(entry.status === "completed" ? entry.completedAt : entry.plannedAt) ?? ""} onChange={(e) => patch(entry.id, entry.status === "completed" ? { completedAt: e.target.value } : { plannedAt: e.target.value })} /></label><label>评分（1-5）<input type="number" min="1" max="5" value={entry.rating ?? ""} onChange={(e) => patch(entry.id, { rating: e.target.value ? Number(e.target.value) : undefined })} /></label></div>
      <textarea value={entry.notes} onChange={(e) => patch(entry.id, { notes: e.target.value })} placeholder="一句感想、摘录、为什么想做……都可以留空" />
      <input value={entry.tags.join("，")} onChange={(e) => patch(entry.id, { tags: e.target.value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean) })} placeholder="标签，用逗号分隔" />
    </article>)}</div>
    {!visible.length && <div className="empty">这里还没有记录。空着也没关系。</div>}
  </section>;
};

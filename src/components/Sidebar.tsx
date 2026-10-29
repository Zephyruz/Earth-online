import { useState } from "react";
import { PageKey } from "../types/game";

const primaryPages: { key: PageKey; label: string; icon: string }[] = [
  { key: "home", label: "首页", icon: "⌂" },
  { key: "tasks", label: "任务", icon: "✓" },
  { key: "gacha", label: "抽卡", icon: "✦" },
  { key: "cardList", label: "卡牌", icon: "◇" },
];

const secondaryPages: { key: PageKey; label: string; icon: string }[] = [
  { key: "planner", label: "计划收集", icon: "▤" },
  { key: "collection", label: "角色图鉴", icon: "▣" },
  { key: "relationships", label: "关系", icon: "♡" },
  { key: "logs", label: "日志", icon: "☰" },
  { key: "achievements", label: "成就", icon: "★" },
  { key: "settings", label: "设置", icon: "⚙" }
];

export const Sidebar = ({ page, onChange }: { page: PageKey; onChange: (page: PageKey) => void }) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const changePage = (next: PageKey) => { onChange(next); setMoreOpen(false); };
  const renderButton = (item: { key: PageKey; label: string; icon: string }, className = "") => (
    <button key={item.key} className={`${page === item.key ? "active" : ""} ${className}`.trim()} onClick={() => changePage(item.key)}>
      <span>{item.icon}</span>{item.label}
    </button>
  );
  const secondaryActive = secondaryPages.some((item) => item.key === page);

  return <nav className="sidebar">
    <div className="brand">
      <span className="brand-mark">EO</span>
      <div><strong>地球 Online</strong><small>单机版</small></div>
    </div>
    {primaryPages.map((item) => renderButton(item, "primary-nav-item"))}
    {secondaryPages.map((item) => renderButton(item, "secondary-nav-item"))}
    <div className={`mobile-more ${moreOpen ? "open" : ""}`}>
      <button className={secondaryActive ? "active" : ""} aria-expanded={moreOpen} onClick={() => setMoreOpen((value) => !value)}><span>•••</span>更多</button>
      {moreOpen && <div className="mobile-more-menu">{secondaryPages.map((item) => renderButton(item))}</div>}
    </div>
  </nav>;
};

import { PageKey } from "../types/game";

const pages: { key: PageKey; label: string; icon: string }[] = [
  { key: "home", label: "首页", icon: "⌂" },
  { key: "tasks", label: "任务", icon: "✓" },
  { key: "gacha", label: "抽卡", icon: "✦" },
  { key: "collection", label: "图鉴", icon: "▣" },
  { key: "cardList", label: "卡牌一览", icon: "◇" },
  { key: "relationships", label: "关系", icon: "♡" },
  { key: "logs", label: "日志", icon: "☰" },
  { key: "achievements", label: "成就", icon: "★" },
  { key: "settings", label: "设置", icon: "⚙" }
];

export const Sidebar = ({ page, onChange }: { page: PageKey; onChange: (page: PageKey) => void }) => (
  <nav className="sidebar">
    <div className="brand">
      <span className="brand-mark">EO</span>
      <div><strong>地球 Online</strong><small>单机版</small></div>
    </div>
    {pages.map((item) => (
      <button key={item.key} className={page === item.key ? "active" : ""} onClick={() => onChange(item.key)}>
        <span>{item.icon}</span>{item.label}
      </button>
    ))}
  </nav>
);

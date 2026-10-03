import { todayKey } from "../utils/date";

export const TopBar = ({ tip }: { tip: string }) => (
  <header className="topbar">
    <div>
      <p className="eyebrow">今日日期 {todayKey()}</p>
      <h1>现实任务 × 卡牌收藏</h1>
    </div>
    <div className="system-tip">{tip}</div>
  </header>
);

import { dailyLiveMilestones } from "../data/defaults";
import { GameState } from "../types/game";

export const DailyLivePanel = ({ game }: { game: GameState }) => {
  const completed = game.tasks.filter((task) => task.type === "daily" && task.completed).length;
  const target = dailyLiveMilestones[dailyLiveMilestones.length - 1].count;

  return <section className="panel daily-live-panel">
    <div className="section-head">
      <div><p className="eyebrow">TODAY'S LIVE MISSION</p><h2>今日 Live</h2></div>
      <strong>{Math.min(completed, target)} / {target}</strong>
    </div>
    <div className="daily-live-track"><i style={{ width: `${Math.min(100, completed / target * 100)}%` }} /></div>
    <div className="daily-live-milestones">
      {dailyLiveMilestones.map((milestone) => {
        const claimed = game.dailyLive.claimedMilestones.includes(milestone.count);
        const reward = [milestone.crystals && `◇ ${milestone.crystals}`, milestone.practiceScore && `♫ ${milestone.practiceScore}`, milestone.miracleGems && `✧ ${milestone.miracleGems}`].filter(Boolean).join("  ");
        return <article key={milestone.count} className={`${claimed ? "claimed" : ""} ${completed >= milestone.count ? "reached" : ""}`}>
          <span>{claimed ? "✓" : milestone.count}</span>
          <div><strong>{milestone.label}</strong><small>{reward}</small></div>
        </article>;
      })}
    </div>
    <p className="muted">完成每日任务后自动领取。阶段奖励不会因撤销任务而重复发放。</p>
  </section>;
};

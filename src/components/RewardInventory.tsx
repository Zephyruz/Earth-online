import { formatDate } from "../utils/date";

interface RewardItem { id: string; name: string; rarity: string; description: string; obtainedAt: string; used: boolean; }

interface Props {
  rewards: RewardItem[];
  onUse: (id: string) => void;
  onDelete: (id: string) => void;
}

export const RewardInventory = ({ rewards, onUse, onDelete }: Props) => (
  <div className="card-grid">
    {rewards.map((reward) => (
      <article key={reward.id} className={`reward-card rarity-${reward.rarity} ${reward.used ? "used" : ""}`}>
        <div className="card-title-row"><strong>{reward.rarity}</strong><span>{reward.used ? "已使用" : "未使用"}</span></div>
        <h3>{reward.name}</h3>
        <p>{reward.description}</p>
        <small>获得于 {formatDate(reward.obtainedAt)}</small>
        <div className="card-actions">
          <button disabled={reward.used} onClick={() => onUse(reward.id)}>使用奖励</button>
          <button className="ghost danger-text" onClick={() => onDelete(reward.id)}>删除</button>
        </div>
      </article>
    ))}
    {rewards.length === 0 && <div className="empty panel">奖励仓库还是空的。去抽一次娱乐活动吧。</div>}
  </div>
);

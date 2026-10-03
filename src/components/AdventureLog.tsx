import { LogEntry } from "../types/game";
import { formatDateTime } from "../utils/date";

export const AdventureLog = ({ logs }: { logs: LogEntry[] }) => (
  <div className="timeline">
    {logs.map((log) => (
      <div key={log.id}>
        <span className="badge">{log.type}</span>
        <strong>{log.title}</strong>
        <p>{log.description}</p>
        <small>{formatDateTime(log.createdAt)}</small>
      </div>
    ))}
    {logs.length === 0 && <div className="empty panel">日志已经清空。新的冒险会从下一次行动开始记录。</div>}
  </div>
);

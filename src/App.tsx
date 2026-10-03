import { useEffect, useMemo, useState } from "react";
import { AddTaskModal } from "./components/AddTaskModal";
import { AdventureLog } from "./components/AdventureLog";
import { CharacterCard } from "./components/CharacterCard";
import { CharacterDetailModal } from "./components/CharacterDetailModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { GachaPanel } from "./components/GachaPanel";
import { GachaResultModal } from "./components/GachaResultModal";
import { CardCollection } from "./components/CardCollection";
import { CardList } from "./components/CardList";
import { PlayerCard } from "./components/PlayerCard";
import { SettingsPanel } from "./components/SettingsPanel";
import { Sidebar } from "./components/Sidebar";
import { TaskList } from "./components/TaskList";
import { Toast } from "./components/Toast";
import { TopBar } from "./components/TopBar";
import { systemTips, taskTypeLabels, TEST_CRYSTAL_GRANT } from "./data/defaults";
import { useGameState } from "./hooks/useGameState";
import { CardPull, Character, PageKey, Task, TaskType } from "./types/game";
import { addInteraction, checkIn, completeTask, deleteCharacter, deleteTask, drawGacha, exchangeFeaturedCard, exchangeVoucher, undoTask, upsertCharacter, upsertTask } from "./utils/gameLogic";
import { importSave, resetGame } from "./utils/storage";
import { todayKey } from "./utils/date";
import { startGachaMusic } from "./utils/gachaAudio";

const taskOrder: TaskType[] = ["daily", "weekly", "main", "side"];

export default function App() {
  const { game, setGame, updateGame } = useGameState();
  const [page, setPage] = useState<PageKey>("home");
  const [toast, setToast] = useState("");
  const [taskModal, setTaskModal] = useState<Task | "new" | null>(null);
  const [characterModal, setCharacterModal] = useState<Character | "new" | null>(null);
  const [confirm, setConfirm] = useState<{ title: string; message: string; action: () => void } | null>(null);
  const [gachaResults, setGachaResults] = useState<CardPull[] | null>(null);
  const [taskType, setTaskType] = useState<"all" | TaskType>("all");
  const [taskStatus, setTaskStatus] = useState<"all" | "todo" | "done">("all");
  const [sort, setSort] = useState("created");
  const tip = useMemo(() => game.settings.systemTips ? systemTips[Math.floor(Math.random() * systemTips.length)] : "系统提示已关闭。", [page, game.settings.systemTips]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTaskModal(null);
        setCharacterModal(null);
        setConfirm(null);
        setGachaResults(null);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const notify = (message: string) => setToast(message);

  const performDraw = (count: 1 | 10) => {
    try {
      const result = drawGacha(game, count);
      if (game.settings.animations) startGachaMusic(game.settings.gachaMusic !== false);
      setGame(result.state);
      setGachaResults(result.results);
      notify("招募完成，卡牌已登录图鉴");
    } catch (error) {
      notify(error instanceof Error ? error.message : "招募失败");
    }
  };

  const requestDraw = (count: 1 | 10) => {
    const cost = count === 10 ? 3000 : 300;
    setConfirm({
      title: `确认招募 ${count} 次`,
      message: `将消耗 ${cost.toLocaleString()} 水晶。当前持有 ${game.player.crystals.toLocaleString()} 水晶，确定继续吗？`,
      action: () => performDraw(count),
    });
  };

  const filteredTasks = useMemo(() => {
    const difficultyRank = { easy: 1, normal: 2, hard: 3 };
    return game.tasks
      .filter((task) => taskType === "all" || task.type === taskType)
      .filter((task) => taskStatus === "all" || (taskStatus === "done" ? task.completed : !task.completed))
      .sort((a, b) => {
        if (sort === "difficulty") return difficultyRank[b.difficulty] - difficultyRank[a.difficulty];
        if (sort === "reward") return (b.crystalReward + b.expReward) - (a.crystalReward + a.expReward);
        if (sort === "deadline") return (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999");
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [game.tasks, taskStatus, taskType, sort]);

  const todayTasks = game.tasks.filter((task) => task.type === "daily");
  const weeklyTasks = game.tasks.filter((task) => task.type === "weekly");
  const completion = todayTasks.length ? Math.round((todayTasks.filter((task) => task.completed).length / todayTasks.length) * 100) : 0;
  const statusText = completion === 0 ? "仍在加载中" : completion <= 30 ? "缓慢启动" : completion <= 60 ? "稳定运行" : completion <= 90 ? "状态良好" : "完美通关";

  const home = (
    <div className="page-grid">
      <PlayerCard player={game.player} />
      <section className="panel">
        <div className="section-head"><h2>今日概览</h2><button disabled={game.player.lastCheckInDate === todayKey()} onClick={() => { updateGame(checkIn); notify("签到完成"); }}>今日签到</button></div>
        <div className="stats-grid">
          <div><strong>{todayTasks.filter((task) => task.completed).length}/{todayTasks.length}</strong><span>今日任务</span></div>
          <div><strong>{weeklyTasks.filter((task) => task.completed).length}/{weeklyTasks.length}</strong><span>本周任务</span></div>
          <div><strong>{game.statistics.todayCrystals}</strong><span>今日水晶</span></div>
          <div><strong>{game.statistics.todayExp}</strong><span>今日经验</span></div>
          <div><strong>{statusText}</strong><span>状态评价</span></div>
          <div><strong>{game.player.currentStreak}</strong><span>连续签到</span></div>
        </div>
      </section>
      <section className="panel">
        <h2>运行统计</h2>
        <div className="stats-grid">
          <div><strong>{game.statistics.completedTasks}</strong><span>完成任务</span></div>
          <div><strong>{game.statistics.gachaPulls}</strong><span>抽卡次数</span></div>
          <div><strong>{game.ownedCards.length}</strong><span>已收集卡牌</span></div>
          <div><strong>{game.characters.length}</strong><span>关系人物</span></div>
        </div>
      </section>
      <section className="panel">
        <h2>近期冒险</h2>
        <AdventureLog logs={game.logs.slice(0, 5)} />
      </section>
    </div>
  );

  const tasks = (
    <section className="panel">
      <div className="section-head"><h2>任务</h2><button onClick={() => setTaskModal("new")}>新增任务</button></div>
      <div className="filters">
        <select value={taskType} onChange={(e) => setTaskType(e.target.value as "all" | TaskType)}><option value="all">全部类型</option>{taskOrder.map((type) => <option key={type} value={type}>{taskTypeLabels[type]}</option>)}</select>
        <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value as "all" | "todo" | "done")}><option value="all">全部状态</option><option value="todo">未完成</option><option value="done">已完成</option></select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="created">创建时间</option><option value="difficulty">难度</option><option value="reward">奖励</option><option value="deadline">截止日期</option></select>
      </div>
      <TaskList tasks={filteredTasks} onComplete={(id) => { updateGame((state) => completeTask(state, id)); notify("任务完成，奖励已发放"); }} onUndo={(id) => { updateGame((state) => undoTask(state, id)); notify("已撤销任务奖励"); }} onEdit={setTaskModal} onDelete={(id) => setConfirm({ title: "删除任务", message: "确定删除这个任务吗？", action: () => { updateGame((state) => deleteTask(state, id)); notify("任务已删除"); } })} />
    </section>
  );

  const relationships = (
    <section className="panel">
      <div className="section-head"><div><h2>关系</h2><p>这里记录的是你对这段关系的主观感受，并不代表对方的真实想法。</p></div><button onClick={() => setCharacterModal("new")}>新增人物</button></div>
      <div className="card-grid">{game.characters.map((character) => <CharacterCard key={character.id} character={character} onOpen={() => setCharacterModal(character)} />)}</div>
      {game.characters.length === 0 && <div className="empty">还没有人物记录。</div>}
    </section>
  );

  const achievements = (
    <section className="panel">
      <h2>成就</h2>
      <div className="card-grid">{game.achievements.map((item) => <article key={item.id} className={`achievement ${item.unlocked ? "unlocked" : ""}`}><span>{item.icon}</span><h3>{item.name}</h3><p>{item.description}</p><small>{item.unlocked ? "已解锁" : `奖励：水晶 ${item.reward.crystals ?? 0}`}</small></article>)}</div>
    </section>
  );

  return (
    <div className={`app theme-${game.settings.theme}`}>
      <Sidebar page={page} onChange={setPage} />
      <main>
        <TopBar tip={tip} />
        {page === "home" && home}
        {page === "tasks" && tasks}
        {page === "gacha" && <GachaPanel game={game} onDraw={requestDraw} onVoucher={() => { try { setGame(exchangeVoucher(game)); notify("已兑换 1 张限定招募券"); } catch (error) { notify(error instanceof Error ? error.message : "兑换失败"); } }} onExchange={(cardId) => setConfirm({ title: "兑换四星卡牌", message: "将优先使用 300 枚贴纸；不足时使用 200 枚贴纸＋10 张限定招募券。确认兑换吗？", action: () => { try { setGame(exchangeFeaturedCard(game, cardId)); notify("卡牌兑换成功"); } catch (error) { notify(error instanceof Error ? error.message : "兑换失败"); } } })} />}
        {page === "collection" && <CardCollection game={game} />}
        {page === "cardList" && <CardList game={game} onChange={setGame} />}
        {page === "relationships" && relationships}
        {page === "logs" && <section className="panel"><div className="section-head"><h2>冒险日志</h2><button className="ghost danger-text" onClick={() => setConfirm({ title: "清空日志", message: "确定清空全部日志吗？", action: () => setGame({ ...game, logs: [] }) })}>清空日志</button></div><AdventureLog logs={game.logs} /></section>}
        {page === "achievements" && achievements}
        {page === "settings" && <SettingsPanel game={game} onChange={setGame} onImport={(text) => { try { setGame(importSave(text)); notify("存档导入成功"); } catch { notify("导入失败：存档格式不正确"); } }} onGrantTestCrystals={() => { updateGame((state) => ({ ...state, player: { ...state.player, crystals: state.player.crystals + TEST_CRYSTAL_GRANT } })); notify("已补充 300,000 测试水晶"); }} onReset={() => setConfirm({ title: "重置全部数据", message: "这会删除当前浏览器里的全部存档，确定继续吗？", action: () => { setGame(resetGame()); notify("游戏已重置"); } })} />}
      </main>
      {taskModal && <AddTaskModal task={taskModal === "new" ? undefined : taskModal} onClose={() => setTaskModal(null)} onSave={(task) => { updateGame((state) => upsertTask(state, task)); setTaskModal(null); notify("任务已保存"); }} />}
      {characterModal && <CharacterDetailModal character={characterModal === "new" ? undefined : characterModal} interactions={characterModal === "new" ? [] : game.interactions.filter((item) => item.characterId === characterModal.id)} onClose={() => setCharacterModal(null)} onSave={(character) => { updateGame((state) => upsertCharacter(state, character)); setCharacterModal(null); notify("人物已保存"); }} onDelete={(id) => setConfirm({ title: "删除人物", message: "会同时删除此人物的互动记录，确定继续吗？", action: () => { updateGame((state) => deleteCharacter(state, id)); setCharacterModal(null); notify("人物已删除"); } })} onInteract={(interaction) => { updateGame((state) => addInteraction(state, interaction)); notify("互动已记录"); }} />}
      {confirm && <ConfirmModal title={confirm.title} message={confirm.message} onCancel={() => setConfirm(null)} onConfirm={() => { confirm.action(); setConfirm(null); }} />}
      {gachaResults && <GachaResultModal results={gachaResults} animations={game.settings.animations} canRepeatTen={game.player.crystals >= 3000} onRepeatTen={() => { setGachaResults(null); requestDraw(10); }} onClose={() => setGachaResults(null)} />}
      <Toast message={toast} />
    </div>
  );
}

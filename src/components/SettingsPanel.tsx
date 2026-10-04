import { ChangeEvent, useEffect, useState } from "react";
import { GameState } from "../types/game";
import { startGachaMusic, stopGachaMusic } from "../utils/gachaAudio";
import { exportSave } from "../utils/storage";

interface Props {
  game: GameState;
  onChange: (game: GameState) => void;
  onImport: (text: string) => void;
  onReset: () => void;
  onGrantTestCrystals: () => void;
  onGrantTestMaterials: () => void;
}

export const SettingsPanel = ({ game, onChange, onImport, onReset, onGrantTestCrystals, onGrantTestMaterials }: Props) => {
  const [testingMusic, setTestingMusic] = useState(false);
  useEffect(() => () => stopGachaMusic(), []);
  const update = (next: GameState) => onChange(next);
  const toggleMusicTest = () => {
    if (testingMusic) {
      stopGachaMusic();
      setTestingMusic(false);
      return;
    }
    startGachaMusic(true);
    setTestingMusic(true);
  };
  const exportFile = () => {
    const blob = new Blob([exportSave(game)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "earth-online-save.json";
    link.click();
    URL.revokeObjectURL(url);
  };
  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onImport(await file.text());
    event.target.value = "";
  };

  return (
    <section className="panel settings">
      <h2>设置</h2>
      <div className="form-grid">
        <label>玩家名称<input value={game.player.name} onChange={(e) => update({ ...game, player: { ...game.player, name: e.target.value } })} /></label>
        <label>当前称号<input value={game.player.title} onChange={(e) => update({ ...game, player: { ...game.player, title: e.target.value } })} /></label>
        <label>当前章节<input value={game.player.chapter} onChange={(e) => update({ ...game, player: { ...game.player, chapter: e.target.value } })} /></label>
      </div>
      <div className="toggle-row">
        <label><input type="checkbox" checked={game.settings.animations} onChange={(e) => update({ ...game, settings: { ...game.settings, animations: e.target.checked } })} /> 开启动画</label>
        <label><input type="checkbox" checked={game.settings.gachaMusic !== false} onChange={(e) => update({ ...game, settings: { ...game.settings, gachaMusic: e.target.checked } })} /> 抽卡音乐</label>
        <label><input type="checkbox" checked={game.settings.systemTips} onChange={(e) => update({ ...game, settings: { ...game.settings, systemTips: e.target.checked } })} /> 显示系统提示</label>
      </div>
      <div className="card-actions">
        <button className={testingMusic ? "ghost" : ""} onClick={toggleMusicTest}>{testingMusic ? "停止试听音乐" : "试听抽卡音乐"}</button>
        <button onClick={onGrantTestCrystals}>补充 300,000 测试水晶</button>
        <button onClick={onGrantTestMaterials}>补充测试养成材料</button>
        <button onClick={exportFile}>导出存档</button>
        <label className="file-button">导入存档<input type="file" accept="application/json" onChange={importFile} /></label>
        <button className="danger" onClick={onReset}>重置全部数据</button>
      </div>
      <div className="subpanel">
        <h3>版本与说明</h3>
        <p>版本 {game.version}。所有数据保存在当前浏览器的 localStorage 中，不需要登录或服务器。</p>
        <p>任务会产出水晶、练习乐谱与奇迹结晶；重复成员转化为心愿碎片。测试补给只用于调试，不计入任务统计。</p>
      </div>
    </section>
  );
};

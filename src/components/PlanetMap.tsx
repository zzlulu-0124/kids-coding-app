import { Gift, ShieldCheck } from "lucide-react";
import type { Mission, Planet, ProgressRecord } from "../types";

type Props = {
  planets: Planet[];
  progress: ProgressRecord;
  onMissionSelect: (mission: Mission) => void;
  onRewards: () => void;
  onParent: () => void;
};

export function PlanetMap({ planets, progress, onMissionSelect, onRewards, onParent }: Props) {
  const totalMissions = planets.reduce((sum, planet) => sum + planet.missions.length, 0);
  const completed = progress.completedMissionIds.length;

  return (
    <section className="page-stack">
      <header className="app-header">
        <div>
          <p className="eyebrow">星球地图</p>
          <h1>{progress.childName} 的探索路线</h1>
        </div>
        <div className="header-actions">
          <button className="icon-button" type="button" onClick={onRewards} aria-label="奖励舱">
            <Gift size={20} />
          </button>
          <button className="ghost-button" type="button" onClick={onParent}>
            <ShieldCheck size={18} />
            家长查看
          </button>
        </div>
      </header>

      <div className="progress-strip">
        <span>飞船修复进度</span>
        <div className="progress-track">
          <div style={{ width: `${Math.round((completed / totalMissions) * 100)}%` }} />
        </div>
        <strong>{completed}/{totalMissions}</strong>
      </div>

      <div className="planet-grid">
        {planets.map((planet, planetIndex) => (
          <article className="planet-panel" key={planet.id}>
            <div className={`planet-orbit orbit-${planetIndex}`} />
            <div>
              <h2>{planet.title}</h2>
              <p>{planet.story}</p>
              <span className="badge-label">{planet.abilityLabel}</span>
            </div>
            <div className="mission-list">
              {planet.missions.map((mission, index) => {
                const done = progress.completedMissionIds.includes(mission.id);
                return (
                  <button
                    className={done ? "mission-button completed" : "mission-button"}
                    key={mission.id}
                    type="button"
                    onClick={() => onMissionSelect(mission)}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {mission.title}
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

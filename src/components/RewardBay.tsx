import { ArrowLeft } from "lucide-react";
import type { Planet, ProgressRecord } from "../types";

type Props = {
  progress: ProgressRecord;
  planets: Planet[];
  onBack: () => void;
};

export function RewardBay({ progress, planets, onBack }: Props) {
  const badges = planets.filter((planet) => planet.missions.every((mission) => progress.completedMissionIds.includes(mission.id)));

  return (
    <section className="page-stack narrow">
      <button className="ghost-button self-start" type="button" onClick={onBack}>
        <ArrowLeft size={18} />
        返回地图
      </button>
      <article className="reward-bay">
        <p className="eyebrow">奖励舱</p>
        <h1>飞船正在一点点修好</h1>
        <div className="ship-status">
          <div className="ship-body">
            <span className="ship-window" />
            <span className="ship-fin top" />
            <span className="ship-fin bottom" />
            <span className="ship-flame" />
          </div>
          <div>
            <strong>{progress.unlockedRewards.length} 个部件已点亮</strong>
            <p>每完成一个任务，飞船就会亮起新的零件。</p>
          </div>
        </div>
        <div className="reward-list">
          {progress.unlockedRewards.length === 0 && <p>完成第一关后，这里会出现飞船奖励。</p>}
          {progress.unlockedRewards.map((reward) => (
            <span key={reward}>{reward}</span>
          ))}
          {badges.map((planet) => (
            <span key={planet.id}>{planet.badge}</span>
          ))}
        </div>
      </article>
    </section>
  );
}

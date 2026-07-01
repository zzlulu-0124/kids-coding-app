import { ArrowLeft, Target } from "lucide-react";
import type { Mission } from "../types";

type Props = {
  mission: Mission;
  onBack: () => void;
  onEnter: () => void;
};

export function MissionIntro({ mission, onBack, onEnter }: Props) {
  return (
    <section className="page-stack narrow">
      <button className="ghost-button self-start" type="button" onClick={onBack}>
        <ArrowLeft size={18} />
        返回小练习
      </button>

      <article className="mission-intro">
        <div className="lesson-chip">
          <Target size={20} />
          任务说明
        </div>
        <h1>{mission.title}</h1>
        <p>{mission.goal}</p>
        <div className="mini-player">
          <div className="play-core">✓</div>
          <span>{missionHint(mission)}</span>
        </div>
        <button className="primary-button large" type="button" onClick={onEnter}>
          进入任务
        </button>
      </article>
    </section>
  );
}

function missionHint(mission: Mission) {
  if (mission.id === "direction-1") {
    return "这一关要放 3 张前进卡。";
  }
  if (mission.id === "direction-3") {
    return "看朝向牌：↑ 上。先放右转卡，再放前进卡。";
  }
  if (mission.id === "loop-3") {
    return "前面有小坑。先放跳跃卡跨过去，再放前进卡。";
  }
  return "现在把卡片排成一列，让机器人按顺序执行。";
}

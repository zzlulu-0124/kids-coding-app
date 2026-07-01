import { ArrowLeft } from "lucide-react";
import type { Planet, ProgressRecord } from "../types";

type Report = {
  childName: string;
  robotName: string;
  completedCount: number;
  rewardCount: number;
  estimatedMinutes: number;
  practicedAbilities: string[];
  stuckPoint: string;
  suggestion: string;
};

type Props = {
  report: Report;
  progress: ProgressRecord;
  planets: Planet[];
  onBack: () => void;
};

export function ParentReport({ report, progress, planets, onBack }: Props) {
  const total = planets.reduce((sum, planet) => sum + planet.missions.length, 0);

  return (
    <section className="page-stack">
      <button className="ghost-button self-start" type="button" onClick={onBack}>
        <ArrowLeft size={18} />
        返回地图
      </button>

      <article className="report-panel">
        <p className="eyebrow">学习报告</p>
        <h1>{report.childName} 和 {report.robotName} 的进度</h1>
        <div className="report-metrics">
          <div>
            <strong>{report.completedCount}</strong>
            <span>已完成关卡</span>
          </div>
          <div>
            <strong>{total}</strong>
            <span>总关卡</span>
          </div>
          <div>
            <strong>{report.rewardCount}</strong>
            <span>已获得奖励</span>
          </div>
          <div>
            <strong>{report.estimatedMinutes}</strong>
            <span>预计学习分钟</span>
          </div>
        </div>
        <div className="ability-strip">
          {report.practicedAbilities.length === 0 ? (
            <span>完成第一关后，这里会显示练习过的能力。</span>
          ) : (
            report.practicedAbilities.map((ability) => <span key={ability}>{ability}</span>)
          )}
        </div>
        <div className="report-copy">
          <p>最近卡点：{report.stuckPoint}</p>
          <p>建议：{report.suggestion}</p>
        </div>
        <div className="course-outline">
          {planets.map((planet) => (
            <div key={planet.id}>
              <h2>{planet.title}</h2>
              <small>{planet.abilityLabel}</small>
              <p>
                {planet.missions.filter((mission) => progress.completedMissionIds.includes(mission.id)).length}
                /{planet.missions.length} 已完成
              </p>
              <span
                className="course-progress"
                style={{
                  width: `${Math.round(
                    (planet.missions.filter((mission) => progress.completedMissionIds.includes(mission.id)).length /
                      planet.missions.length) *
                      100
                  )}%`
                }}
              />
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

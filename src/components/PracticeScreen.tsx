import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { findCard } from "../data/course";
import type { CommandType, Mission } from "../types";

type Props = {
  mission: Mission;
  onBack: () => void;
  onDone: () => void;
};

export function PracticeScreen({ mission, onBack, onDone }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const correctKey = mission.id === "direction-1" ? "three-forward" : mission.solution[0]?.type ?? "forward";
  const passed = selected === correctKey;
  const options = practiceOptions(mission);

  return (
    <section className="page-stack narrow">
      <button className="ghost-button self-start" type="button" onClick={onBack}>
        <ArrowLeft size={18} />
        返回动画
      </button>

      <article className="practice-panel">
        <p className="eyebrow">小练习</p>
        <h1>先确认一下</h1>
        <p>{practiceQuestion(mission)}</p>

        <div className="practice-explainer" aria-label="小练习地图">
          <div className="practice-robot-card">
            <span>🤖</span>
            <strong>{directionLabel(mission.startDirection)}</strong>
          </div>
          <div className="practice-rule-card">
            <small>先看箭头</small>
            <strong>{practiceRule(mission)}</strong>
            <span>{practiceAction(mission)}</span>
          </div>
          <div className="practice-target-card">
            <small>目标</small>
            <strong>⚡ 基地</strong>
          </div>
        </div>

        <div className="practice-options">
          {mission.id === "direction-1" ? (
            <>
              <button
                className={selected === "two-forward" ? "practice-option wrong" : "practice-option"}
                type="button"
                onClick={() => setSelected("two-forward")}
              >
                2 张前进卡
              </button>
              <button
                className={selected === "three-forward" ? "practice-option selected" : "practice-option"}
                type="button"
                onClick={() => setSelected("three-forward")}
              >
                3 张前进卡
              </button>
              <button
                className={selected === "one-forward" ? "practice-option wrong" : "practice-option"}
                type="button"
                onClick={() => setSelected("one-forward")}
              >
                1 张前进卡
              </button>
            </>
          ) : (
            <>
              {options.map((option) => (
                <button
                  className={selected === option.key ? (passed ? "practice-option selected" : "practice-option wrong") : "practice-option"}
                  type="button"
                  key={option.key}
                  onClick={() => setSelected(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </>
          )}
        </div>

        {passed && (
          <p className="practice-result">
            <CheckCircle2 size={18} />
            答对了，可以进入实操任务。
          </p>
        )}
        {selected && !passed && <p className="form-error">这张卡还不合适，先看机器人箭头，再看第一步要转身还是移动。</p>}

        <button className="primary-button large" type="button" onClick={onDone} disabled={!passed}>
          进入任务
        </button>
      </article>
    </section>
  );
}

function practiceOptions(mission: Mission) {
  const correct = mission.solution[0]?.type ?? "forward";
  const preferred: CommandType[] = [correct, ...mission.availableCards, "forward", "left", "right"];
  return Array.from(new Set(preferred))
    .slice(0, 3)
    .map((type) => {
      const card = findCard(type);
      return { key: type, label: `${card.label}卡` };
    });
}

function practiceQuestion(mission: Mission) {
  if (mission.id === "direction-1") {
    return "机器人和能量站中间空了两格，要放几张前进卡？";
  }
  if (mission.id === "direction-3") {
    return "机器人箭头朝上，基地在右边。第一步要先转身还是前进？";
  }
  if (mission.id === "loop-3") {
    return "前面有小坑时，哪张卡可以跨过去？";
  }
  if (mission.ability === "loop" && mission.solution.some((step) => step.type === "repeat")) {
    return "看到连续一样的路线时，可以先想想要不要用重复卡。";
  }
  if (mission.ability === "debug") {
    return "先看机器人箭头和目标位置，再选第一张正确的路线卡。";
  }
  return "先看目标，再选第一张合适的指令卡。";
}

function directionLabel(direction: Mission["startDirection"]) {
  if (direction === "north") return "↑ 朝上";
  if (direction === "south") return "↓ 朝下";
  if (direction === "west") return "← 朝左";
  return "→ 朝右";
}

function practiceRule(mission: Mission) {
  const first = mission.solution[0]?.type;
  if (first === "left") return "第一步：原地向左转身";
  if (first === "right") return "第一步：原地向右转身";
  if (first === "jump") return "第一步：跨过前方一格";
  if (first === "repeat") return "第一步：连续前进三格";
  return "第一步：沿箭头前进一格";
}

function practiceAction(mission: Mission) {
  const first = mission.solution[0]?.type;
  if (first === "left" || first === "right") return "转身不会走路，转完还要再放前进。";
  if (first === "jump") return "跳跃会跨过前方的小坑。";
  if (first === "repeat") return "重复卡相当于连续前进三次。";
  return "前进会沿机器人箭头方向走。";
}

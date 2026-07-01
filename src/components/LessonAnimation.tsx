import { ArrowLeft, Clapperboard, Headphones, Volume2 } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { findCard } from "../data/course";
import { runMission } from "../logic/robotEngine";
import type { Cell, CommandStep, Direction, Mission } from "../types";

type Props = {
  mission: Mission;
  onBack: () => void;
  onDone: () => void;
};

export function LessonAnimation({ mission, onBack, onDone }: Props) {
  const isVideo = mission.introKind === "video";
  const narration = useMemo(() => buildNarration(mission), [mission]);
  const [spoken, setSpoken] = useState(false);

  function playNarration() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(narration);
      utterance.lang = "zh-CN";
      utterance.rate = 0.9;
      utterance.pitch = 1.15;
      window.speechSynthesis.speak(utterance);
    }
    setSpoken(true);
  }

  return (
    <section className="page-stack narrow">
      <button className="ghost-button self-start" type="button" onClick={onBack}>
        <ArrowLeft size={18} />
        返回地图
      </button>

      <article className="mission-intro">
        <div className="lesson-chip">
          {isVideo ? <Clapperboard size={20} /> : <Headphones size={20} />}
          {isVideo ? "2-4 分钟短动画" : "语音和动画演示"}
        </div>
        <h1>{mission.title}</h1>
        <p>{mission.goal}</p>
        <ShortAnimation mission={mission} isVideo={isVideo} narration={narration} spoken={spoken} />
        <div className="lesson-actions">
          <button className="voice-button" type="button" onClick={playNarration}>
            <Volume2 size={18} />
            {isVideo ? "播放讲解" : "播放语音"}
          </button>
          <button className="primary-button large" type="button" onClick={onDone}>
            我看懂了
          </button>
        </div>
      </article>
    </section>
  );
}

function ShortAnimation({
  mission,
  isVideo,
  narration,
  spoken
}: {
  mission: Mission;
  isVideo: boolean;
  narration: string;
  spoken: boolean;
}) {
  const routeCells = useMemo(() => runMission(mission, mission.solution).visited, [mission]);
  const timeline = useMemo(() => buildAnimationTimeline(mission), [mission]);
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    setFrameIndex(0);
    if (timeline.length <= 1) return;
    const timer = window.setInterval(() => {
      setFrameIndex((current) => {
        if (current >= timeline.length - 1) {
          window.clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, isVideo ? 900 : 1050);
    return () => window.clearInterval(timer);
  }, [isVideo, mission.id, timeline.length]);

  const currentFrame = timeline[frameIndex] ?? timeline[0];
  const robotCell = currentFrame.position;
  const activeCommand = currentFrame.commandIndex >= 0 ? mission.solution[currentFrame.commandIndex] : null;
  const activeCard = activeCommand ? findCard(activeCommand.type) : null;
  const isFinished = frameIndex === timeline.length - 1;

  return (
    <div className="story-player" aria-label="短动画">
      <div className="story-stage">
        <div className="story-sky">
          <span className="story-star star-one" />
          <span className="story-star star-two" />
          <span className="story-star star-three" />
          <span className="story-comet" />
        </div>
        <div className="story-grid" style={{ "--story-grid-size": mission.gridSize } as CSSProperties}>
          {Array.from({ length: mission.gridSize * mission.gridSize }, (_, cellIndex) => {
            const x = cellIndex % mission.gridSize;
            const y = Math.floor(cellIndex / mission.gridSize);
            const isRobot = robotCell.x === x && robotCell.y === y;
            const isTarget = mission.target.x === x && mission.target.y === y;
            const isObstacle = mission.obstacles.some((cell) => cell.x === x && cell.y === y);
            const isRoute = routeCells.some((cell) => cell.x === x && cell.y === y);
            return (
              <span className={isRoute ? "story-cell route" : "story-cell"} key={`${x}-${y}`}>
                {isRoute && !isRobot && !isTarget && <span className="story-route-dot" />}
                {isObstacle && <span className="story-obstacle">◆</span>}
                {isTarget && (
                  <span className="story-energy">
                    <span>⚡</span>
                  </span>
                )}
                {isRobot && (
                  <span className="story-robot" key={`robot-${frameIndex}`}>
                    🤖
                    <strong>{directionArrow(currentFrame.direction)}</strong>
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>

      <div className="story-copy">
        <span className="story-status">
          {isFinished ? "短动画播放完成" : isVideo ? "短动画正在播放" : "语音引导准备好了"}
        </span>
        <h2>{mission.title}</h2>
        <p>{narration}</p>
        <p className="story-current-step">
          {activeCard ? `正在执行：${activeCard.label} - ${describeCommand(activeCommand, currentFrame.direction)}` : "先看目标和机器人箭头。"}
        </p>
        {spoken && <p className="spoken-hint">正在给孩子读这段任务提示。</p>}
        <div className="story-card-demo">
          {mission.solution.map((command, index) => {
            const card = findCard(command.type);
            return (
              <span
                className={index === currentFrame.commandIndex ? "active" : index < currentFrame.commandIndex ? "done" : ""}
                key={`${command.type}-${index}`}
              >
                {card.icon} {card.label}
              </span>
            );
          })}
          <button className="story-replay" type="button" onClick={() => setFrameIndex(0)}>
            ▶ 重新播放
          </button>
        </div>
        <div className="story-steps">
          <span>1. 看目标</span>
          <span>2. 选卡片</span>
          <span>3. 让机器人出发</span>
        </div>
      </div>
    </div>
  );
}

type TimelineFrame = {
  position: Cell;
  direction: Direction;
  commandIndex: number;
};

function buildAnimationTimeline(mission: Mission): TimelineFrame[] {
  let position = mission.start;
  let direction = mission.startDirection;
  const frames: TimelineFrame[] = [{ position, direction, commandIndex: -1 }];

  mission.solution.forEach((command, commandIndex) => {
    const times = command.type === "repeat" ? command.repeatCount ?? 3 : 1;
    for (let index = 0; index < times; index += 1) {
      if (command.type === "left") {
        direction = turnLeft(direction);
        frames.push({ position, direction, commandIndex });
      } else if (command.type === "right") {
        direction = turnRight(direction);
        frames.push({ position, direction, commandIndex });
      } else {
        position = nextPosition(position, direction, command);
        frames.push({ position, direction, commandIndex });
      }
    }
  });

  return frames;
}

function nextPosition(position: Cell, direction: Direction, command: CommandStep): Cell {
  const distance = command.type === "jump" ? 2 : 1;
  if (command.type === "backward") {
    if (direction === "north") return { x: position.x, y: position.y + distance };
    if (direction === "south") return { x: position.x, y: position.y - distance };
    if (direction === "east") return { x: position.x - distance, y: position.y };
    return { x: position.x + distance, y: position.y };
  }
  if (direction === "north") return { x: position.x, y: position.y - distance };
  if (direction === "south") return { x: position.x, y: position.y + distance };
  if (direction === "east") return { x: position.x + distance, y: position.y };
  return { x: position.x - distance, y: position.y };
}

function turnLeft(direction: Direction): Direction {
  if (direction === "north") return "west";
  if (direction === "west") return "south";
  if (direction === "south") return "east";
  return "north";
}

function turnRight(direction: Direction): Direction {
  if (direction === "north") return "east";
  if (direction === "east") return "south";
  if (direction === "south") return "west";
  return "north";
}

function describeCommand(command: CommandStep | null, direction: Direction) {
  if (!command) return "";
  if (command.type === "left") return "原地向左转身";
  if (command.type === "right") return "原地向右转身";
  if (command.type === "jump") return `沿${directionName(direction)}方向跨过一格`;
  if (command.type === "repeat") return `沿${directionName(direction)}方向连续前进`;
  if (command.type === "backward") return `沿${directionName(direction)}反方向后退`;
  return `沿${directionName(direction)}方向前进一格`;
}

function directionName(direction: Direction) {
  if (direction === "north") return "上";
  if (direction === "south") return "下";
  if (direction === "west") return "左";
  return "右";
}

function directionArrow(direction: Mission["startDirection"]) {
  if (direction === "north") return "↑";
  if (direction === "south") return "↓";
  if (direction === "west") return "←";
  return "→";
}

function buildNarration(mission: Mission) {
  if (mission.id === "direction-1") {
    return "小小指挥官，豆豆会听你的指令。请先看清能量站的位置，中间空了两格，所以要放三张前进卡，让豆豆一步一步走过去。";
  }
  if (mission.id === "direction-3") {
    return "小小指挥官，这一关豆豆面朝上，基地在右边。先放右转卡，让豆豆转向右边，再放前进卡走到基地。";
  }
  if (mission.planetId === "direction") {
    return `小小指挥官，豆豆会听你的指令。这一关是${mission.title}。先看目标，再把前进、左转或右转卡片按顺序排好。`;
  }
  if (mission.planetId === "loop") {
    return `小小指挥官，这一关是${mission.title}。如果路线里有重复动作，可以试试重复卡，让豆豆更省力。`;
  }
  return `小小指挥官，这一关是${mission.title}。如果豆豆走错了，不要着急，找出有问题的卡片，再换一步试试。`;
}

import { ArrowLeft, Play, RotateCcw, Undo2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { commandCards, findCard } from "../data/course";
import type { Cell, CommandType, Direction, Mission } from "../types";
import { runMission, type MissionResult, type RuntimeCommand } from "../logic/robotEngine";
import type { CSSProperties } from "react";

type Props = {
  mission: Mission;
  commands: RuntimeCommand[];
  result: MissionResult | null;
  onAddCommand: (type: CommandType) => void;
  onRemoveLast: () => void;
  onReset: () => void;
  onRun: () => void;
  onBack: () => void;
};

export function MissionPlay({ mission, commands, onAddCommand, onRemoveLast, onReset, onRun, onBack }: Props) {
  const available = commandCards.filter((card) => mission.availableCards.includes(card.type));
  const routeCells = useMemo(() => runMission(mission, mission.solution).visited, [mission]);
  const [executionFrames, setExecutionFrames] = useState<ExecutionFrame[]>([]);
  const [executionIndex, setExecutionIndex] = useState(0);
  const isExecuting = executionFrames.length > 0;
  const activeFrame = executionFrames[executionIndex] ?? {
    position: mission.start,
    direction: mission.startDirection,
    commandIndex: -1
  };

  useEffect(() => {
    setExecutionFrames([]);
    setExecutionIndex(0);
  }, [mission.id]);

  useEffect(() => {
    if (!isExecuting) return;

    if (executionIndex >= executionFrames.length - 1) {
      const doneTimer = window.setTimeout(() => {
        onRun();
      }, 500);
      return () => window.clearTimeout(doneTimer);
    }

    const stepTimer = window.setTimeout(() => {
      setExecutionIndex((current) => Math.min(current + 1, executionFrames.length - 1));
    }, 620);

    return () => window.clearTimeout(stepTimer);
  }, [executionFrames.length, executionIndex, isExecuting, onRun]);

  function startExecution() {
    if (commands.length === 0 || isExecuting) return;
    setExecutionFrames(buildExecutionFrames(mission, commands));
    setExecutionIndex(0);
  }

  return (
    <section className="play-screen">
      <header className="app-header compact">
        <button className="ghost-button" type="button" onClick={onBack}>
          <ArrowLeft size={18} />
          任务说明
        </button>
        <div>
          <p className="eyebrow">{mission.goal}</p>
          <h1>{mission.title}</h1>
        </div>
      </header>

      <div className="play-layout">
        <div className="grid-wrap">
          <div className="board-chip-row">
            <div className="distance-chip">朝向：{directionLabel(mission.startDirection)}</div>
            {mission.id === "direction-1" && <div className="distance-chip">目标距离：3 步</div>}
            {mission.id === "direction-3" && <div className="distance-chip">先右转，再前进</div>}
          </div>
          {isExecuting && (
            <div className="execution-banner" aria-live="polite">
              <strong>执行中</strong>
              <span>{executionText(commands[activeFrame.commandIndex], activeFrame.direction)}</span>
            </div>
          )}
          <div
            className="grid-board"
            style={
              {
                "--grid-size": mission.gridSize,
                "--robot-left": `${((activeFrame.position.x + 0.5) / mission.gridSize) * 100}%`,
                "--robot-top": `${((activeFrame.position.y + 0.5) / mission.gridSize) * 100}%`
              } as CSSProperties
            }
          >
          {Array.from({ length: mission.gridSize * mission.gridSize }, (_, cellIndex) => {
            const x = cellIndex % mission.gridSize;
            const y = Math.floor(cellIndex / mission.gridSize);
            const isTarget = mission.target.x === x && mission.target.y === y;
            const isObstacle = mission.obstacles.some((cell) => cell.x === x && cell.y === y);
            const routeIndex = routeCells.findIndex((cell) => cell.x === x && cell.y === y);
            const showRouteHint = routeIndex > 0 && !isTarget && !isObstacle;
            return (
              <div className={routeIndex >= 0 ? "grid-cell route-cell" : "grid-cell"} key={`${x}-${y}`}>
                {showRouteHint && <span className="step-token">{routeIndex}</span>}
                {isTarget && <span className="target-token">⚡</span>}
                {isObstacle && <span className="rock-token">◆</span>}
              </div>
            );
          })}
            <span className={isExecuting ? "robot-token play-robot executing" : "robot-token play-robot"}>
              🤖
              <strong>{directionArrow(activeFrame.direction)}</strong>
            </span>
          </div>
        </div>

        <aside className="command-panel">
          <div className="command-heading">
            <h2>指令卡片</h2>
            <p>{commandHint(mission)}</p>
          </div>
          <div className="card-bank">
            {available.map((card) => (
              <button
                aria-label={card.label}
                className="command-card"
                type="button"
                key={card.type}
                onClick={() => onAddCommand(card.type)}
                disabled={isExecuting}
              >
                <span aria-hidden="true">{card.icon}</span>
                <strong>{card.label}</strong>
                <small>{cardMeaning(card.type)}</small>
              </button>
            ))}
          </div>

          <div className="rule-box">
            <strong>先看机器人身上的箭头</strong>
            <span>前进不是固定向上走，而是沿着箭头方向走一格。左转身和右转身只会原地改变箭头方向。</span>
          </div>

          <div className="program-row" aria-label="已选择指令">
            {commands.length === 0 && <span className="empty-program">把卡片放到这里</span>}
            {commands.map((command, index) => {
              const card = findCard(command.type);
              return (
                <span
                  className={
                    index === activeFrame.commandIndex
                      ? "program-card active"
                      : index < activeFrame.commandIndex
                        ? "program-card done"
                        : "program-card"
                  }
                  key={`${command.type}-${index}`}
                >
                  {card.icon} {card.label}
                </span>
              );
            })}
          </div>

          <div className="solution-guide" aria-label="路线提示">
            <h3>这关要做的动作</h3>
            {buildStepGuide(mission).map((step) => (
              <div className="solution-step" key={step.order}>
                <span>{step.order}</span>
                <strong>{step.card}</strong>
                <small>{step.explain}</small>
              </div>
            ))}
          </div>

          <div className="tool-row action-dock">
            <button className="icon-text-button" type="button" onClick={onRemoveLast} disabled={commands.length === 0 || isExecuting}>
              <Undo2 size={18} />
              撤回
            </button>
            <button className="icon-text-button" type="button" onClick={onReset} disabled={commands.length === 0 || isExecuting}>
              <RotateCcw size={18} />
              清空
            </button>
            <button className="primary-button" type="button" onClick={startExecution} disabled={commands.length === 0 || isExecuting}>
              <Play size={18} />
              {isExecuting ? "执行中" : "开始执行"}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

type ExecutionFrame = {
  position: Cell;
  direction: Direction;
  commandIndex: number;
};

function buildExecutionFrames(mission: Mission, commands: RuntimeCommand[]): ExecutionFrame[] {
  let position = mission.start;
  let direction = mission.startDirection;
  const frames: ExecutionFrame[] = [{ position, direction, commandIndex: -1 }];

  commands.forEach((command, commandIndex) => {
    const times = command.type === "repeat" ? command.repeatCount ?? 3 : 1;

    for (let index = 0; index < times; index += 1) {
      if (command.type === "left") {
        direction = turnLeft(direction);
        frames.push({ position, direction, commandIndex });
        continue;
      }

      if (command.type === "right") {
        direction = turnRight(direction);
        frames.push({ position, direction, commandIndex });
        continue;
      }

      const next = nextCell(position, direction, command.type);
      if (isOutside(next, mission.gridSize) || mission.obstacles.some((obstacle) => sameCell(obstacle, next))) {
        frames.push({ position, direction, commandIndex });
        return;
      }

      position = next;
      frames.push({ position, direction, commandIndex });
    }
  });

  return frames;
}

function nextCell(position: Cell, direction: Direction, type: CommandType): Cell {
  const distance = type === "jump" ? 2 : 1;

  if (type === "backward") {
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

function sameCell(a: Cell, b: Cell) {
  return a.x === b.x && a.y === b.y;
}

function isOutside(cell: Cell, gridSize: number) {
  return cell.x < 0 || cell.y < 0 || cell.x >= gridSize || cell.y >= gridSize;
}

function executionText(command: RuntimeCommand | undefined, direction: Direction) {
  if (!command) return "机器人准备出发";
  if (command.type === "left") return "原地向左转身";
  if (command.type === "right") return "原地向右转身";
  if (command.type === "jump") return `沿${directionName(direction)}方向跨过一格`;
  if (command.type === "repeat") return `沿${directionName(direction)}方向连续前进`;
  if (command.type === "backward") return `沿${directionName(direction)}反方向后退`;
  return `沿${directionName(direction)}方向前进一格`;
}

function directionArrow(direction: Mission["startDirection"]) {
  if (direction === "north") return "↑";
  if (direction === "south") return "↓";
  if (direction === "west") return "←";
  return "→";
}

function directionLabel(direction: Mission["startDirection"]) {
  if (direction === "north") return "↑ 上";
  if (direction === "south") return "↓ 下";
  if (direction === "west") return "← 左";
  return "→ 右";
}

function commandHint(mission: Mission) {
  if (mission.id === "direction-1") return "点 3 次前进卡，排成三步路线。";
  if (mission.id === "direction-3") return "这一关按顺序放：右转身、前进。";
  if (mission.id === "loop-3") return "这一关按顺序放：跳跃、前进。";
  return `最多放 ${mission.maxCards} 张，排好后让机器人执行。`;
}

function cardMeaning(type: CommandType) {
  if (type === "forward") return "沿箭头走 1 格";
  if (type === "left") return "原地向左转";
  if (type === "right") return "原地向右转";
  if (type === "jump") return "跨过前方 1 格";
  if (type === "repeat") return "连续前进 3 格";
  return "向后退 1 格";
}

function buildStepGuide(mission: Mission) {
  let facing = mission.startDirection;
  return mission.solution.map((step, index) => {
    const card = findCard(step.type);
    const nextFacing = step.type === "left" ? turnLeft(facing) : step.type === "right" ? turnRight(facing) : facing;
    const explain = explainStep(step.type, facing, nextFacing);
    facing = nextFacing;
    return { order: index + 1, card: card.label, explain };
  });
}

function explainStep(type: CommandType, facing: Mission["startDirection"], nextFacing: Mission["startDirection"]) {
  if (type === "left") return `原地转身：从${directionName(facing)}变成${directionName(nextFacing)}`;
  if (type === "right") return `原地转身：从${directionName(facing)}变成${directionName(nextFacing)}`;
  if (type === "forward") return `沿${directionName(facing)}方向走 1 格`;
  if (type === "jump") return `沿${directionName(facing)}方向跨过 1 格`;
  if (type === "repeat") return `沿${directionName(facing)}方向连续走 3 格`;
  return `沿${directionName(facing)}反方向退 1 格`;
}

function directionName(direction: Mission["startDirection"]) {
  if (direction === "north") return "上";
  if (direction === "south") return "下";
  if (direction === "west") return "左";
  return "右";
}

function turnLeft(direction: Mission["startDirection"]): Mission["startDirection"] {
  if (direction === "north") return "west";
  if (direction === "west") return "south";
  if (direction === "south") return "east";
  return "north";
}

function turnRight(direction: Mission["startDirection"]): Mission["startDirection"] {
  if (direction === "north") return "east";
  if (direction === "east") return "south";
  if (direction === "south") return "west";
  return "north";
}

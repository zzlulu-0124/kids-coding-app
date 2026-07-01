import type { Cell, CommandStep, CommandType, Direction, Mission } from "../types";

export type RuntimeCommand = CommandStep;

export type MissionResult = {
  success: boolean;
  finalPosition: Cell;
  finalDirection: Direction;
  visited: Cell[];
  reason: "target" | "edge" | "obstacle" | "not-there";
};

const turnLeft: Record<Direction, Direction> = {
  north: "west",
  west: "south",
  south: "east",
  east: "north"
};

const turnRight: Record<Direction, Direction> = {
  north: "east",
  east: "south",
  south: "west",
  west: "north"
};

function nextCell(position: Cell, direction: Direction, command: CommandType): Cell {
  const distance = command === "jump" ? 2 : 1;

  if (command === "backward") {
    return direction === "north"
      ? { x: position.x, y: position.y + distance }
      : direction === "south"
        ? { x: position.x, y: position.y - distance }
        : direction === "east"
          ? { x: position.x - distance, y: position.y }
          : { x: position.x + distance, y: position.y };
  }

  return direction === "north"
    ? { x: position.x, y: position.y - distance }
    : direction === "south"
      ? { x: position.x, y: position.y + distance }
      : direction === "east"
        ? { x: position.x + distance, y: position.y }
        : { x: position.x - distance, y: position.y };
}

function sameCell(a: Cell, b: Cell) {
  return a.x === b.x && a.y === b.y;
}

function isOutside(cell: Cell, gridSize: number) {
  return cell.x < 0 || cell.y < 0 || cell.x >= gridSize || cell.y >= gridSize;
}

export function runMission(mission: Mission, commands: RuntimeCommand[]): MissionResult {
  let position = mission.start;
  let direction = mission.startDirection;
  const visited = [position];

  for (const command of commands) {
    const times = command.type === "repeat" ? command.repeatCount ?? 3 : 1;

    for (let index = 0; index < times; index += 1) {
      if (command.type === "left") {
        direction = turnLeft[direction];
        continue;
      }

      if (command.type === "right") {
        direction = turnRight[direction];
        continue;
      }

      const next = nextCell(position, direction, command.type);
      if (isOutside(next, mission.gridSize)) {
        return { success: false, finalPosition: position, finalDirection: direction, visited, reason: "edge" };
      }
      if (mission.obstacles.some((obstacle) => sameCell(obstacle, next))) {
        return { success: false, finalPosition: position, finalDirection: direction, visited, reason: "obstacle" };
      }
      position = next;
      visited.push(position);
    }
  }

  const success = sameCell(position, mission.target);
  return {
    success,
    finalPosition: position,
    finalDirection: direction,
    visited,
    reason: success ? "target" : "not-there"
  };
}

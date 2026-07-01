import { runMission } from "../logic/robotEngine";
import { planets } from "../data/course";
import type { Mission } from "../types";

const baseMission: Mission = {
  id: "test",
  planetId: "direction",
  title: "测试任务",
  goal: "到达目标",
  ability: "sequence",
  introKind: "voice",
  gridSize: 4,
  start: { x: 0, y: 1 },
  startDirection: "east",
  target: { x: 2, y: 1 },
  obstacles: [],
  solution: [{ type: "forward" }, { type: "forward" }],
  availableCards: ["forward", "left", "right"],
  maxCards: 5,
  reward: "测试奖励"
};

describe("runMission", () => {
  it("moves forward and succeeds when the robot reaches the target", () => {
    const result = runMission(baseMission, [{ type: "forward" }, { type: "forward" }]);
    expect(result.success).toBe(true);
    expect(result.finalPosition).toEqual({ x: 2, y: 1 });
  });

  it("fails gently when the robot hits the edge", () => {
    const result = runMission(baseMission, [
      { type: "left" },
      { type: "forward" },
      { type: "forward" }
    ]);
    expect(result.success).toBe(false);
    expect(result.reason).toBe("edge");
  });

  it("fails gently when the robot hits an obstacle", () => {
    const mission = { ...baseMission, obstacles: [{ x: 1, y: 1 }] };
    const result = runMission(mission, [{ type: "forward" }]);
    expect(result.success).toBe(false);
    expect(result.reason).toBe("obstacle");
  });

  it("lets jump move across one grid cell", () => {
    const mission = { ...baseMission, target: { x: 2, y: 1 }, obstacles: [{ x: 1, y: 1 }] };
    const result = runMission(mission, [{ type: "jump" }]);
    expect(result.success).toBe(true);
    expect(result.finalPosition).toEqual({ x: 2, y: 1 });
  });

  it("keeps every course mission reachable with its own route", () => {
    const missions = planets.flatMap((planet) => planet.missions);
    const layouts = new Set<string>();

    for (const mission of missions) {
      const result = runMission(mission, mission.solution);
      layouts.add(
        JSON.stringify({
          gridSize: mission.gridSize,
          start: mission.start,
          startDirection: mission.startDirection,
          target: mission.target,
          obstacles: mission.obstacles,
          solution: mission.solution
        })
      );

      expect(result.success, mission.id).toBe(true);
      expect(result.finalPosition, mission.id).toEqual(mission.target);
      expect(result.reason, mission.id).toBe("target");
      for (const visited of result.visited) {
        expect(visited.x, `${mission.id} visited x outside`).toBeGreaterThanOrEqual(0);
        expect(visited.y, `${mission.id} visited y outside`).toBeGreaterThanOrEqual(0);
        expect(visited.x, `${mission.id} visited x outside`).toBeLessThan(mission.gridSize);
        expect(visited.y, `${mission.id} visited y outside`).toBeLessThan(mission.gridSize);
        expect(mission.obstacles.some((cell) => cell.x === visited.x && cell.y === visited.y), `${mission.id} route hits obstacle`).toBe(false);
      }
    }

    expect(layouts.size).toBeGreaterThan(20);
  });

  it("keeps every course mission instruction consistent with its answer", () => {
    const missions = planets.flatMap((planet) => planet.missions);
    const misleadingCopy = ["两块能量", "少一步", "找出路线问题", "哪张卡有问题", "重复转圈"];

    for (const mission of missions) {
      const copy = `${mission.title}${mission.goal}`;
      const solutionTypes = mission.solution.map((step) => step.type);

      expect(mission.solution.length, `${mission.id} answer length`).toBeLessThanOrEqual(mission.maxCards);
      expect(mission.availableCards.length, `${mission.id} available cards`).toBeGreaterThan(0);
      expect(mission.gridSize, `${mission.id} grid too small`).toBeGreaterThanOrEqual(4);
      expect(mission.gridSize, `${mission.id} grid too large`).toBeLessThanOrEqual(6);
      expect(mission.start.x, `${mission.id} start x outside`).toBeGreaterThanOrEqual(0);
      expect(mission.start.y, `${mission.id} start y outside`).toBeGreaterThanOrEqual(0);
      expect(mission.target.x, `${mission.id} target x outside`).toBeGreaterThanOrEqual(0);
      expect(mission.target.y, `${mission.id} target y outside`).toBeGreaterThanOrEqual(0);
      expect(mission.start.x, `${mission.id} start x outside`).toBeLessThan(mission.gridSize);
      expect(mission.start.y, `${mission.id} start y outside`).toBeLessThan(mission.gridSize);
      expect(mission.target.x, `${mission.id} target x outside`).toBeLessThan(mission.gridSize);
      expect(mission.target.y, `${mission.id} target y outside`).toBeLessThan(mission.gridSize);
      expect(mission.obstacles.some((cell) => cell.x === mission.target.x && cell.y === mission.target.y), `${mission.id} target blocked`).toBe(false);
      expect(mission.obstacles.some((cell) => cell.x === mission.start.x && cell.y === mission.start.y), `${mission.id} start blocked`).toBe(false);
      for (const obstacle of mission.obstacles) {
        expect(obstacle.x, `${mission.id} obstacle x outside`).toBeGreaterThanOrEqual(0);
        expect(obstacle.y, `${mission.id} obstacle y outside`).toBeGreaterThanOrEqual(0);
        expect(obstacle.x, `${mission.id} obstacle x outside`).toBeLessThan(mission.gridSize);
        expect(obstacle.y, `${mission.id} obstacle y outside`).toBeLessThan(mission.gridSize);
      }
      for (const phrase of misleadingCopy) {
        expect(copy, `${mission.id} still uses misleading copy: ${phrase}`).not.toContain(phrase);
      }

      for (const step of mission.solution) {
        expect(mission.availableCards, `${mission.id} unavailable answer card ${step.type}`).toContain(step.type);
      }

      if (copy.includes("跳")) {
        expect(solutionTypes, `${mission.id} says jump but answer has no jump`).toContain("jump");
      }
      if (copy.includes("右转")) {
        expect(solutionTypes, `${mission.id} says right turn but answer has no right turn`).toContain("right");
      }
      if (copy.includes("左转")) {
        expect(solutionTypes, `${mission.id} says left turn but answer has no left turn`).toContain("left");
      }
      if (copy.includes("重复")) {
        expect(solutionTypes, `${mission.id} says repeat but answer has no repeat`).toContain("repeat");
      }
    }
  });
});

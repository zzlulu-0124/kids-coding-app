import type { Cell, CommandCard, CommandStep, CommandType, Direction, Mission, Planet } from "../types";

export const commandCards: CommandCard[] = [
  { type: "forward", label: "前进", icon: "↑" },
  { type: "backward", label: "后退", icon: "↓" },
  { type: "left", label: "左转身", icon: "↺" },
  { type: "right", label: "右转身", icon: "↻" },
  { type: "jump", label: "跳跃", icon: "⇡" },
  { type: "repeat", label: "重复", icon: "×3", repeatCount: 3 }
];

const directionCards: CommandType[] = ["forward", "left", "right"];
const loopCards: CommandType[] = ["forward", "left", "right", "repeat"];
const debugCards: CommandType[] = ["forward", "left", "right", "repeat"];

function mission(
  id: string,
  planetId: string,
  title: string,
  goal: string,
  reward: string,
  availableCards: CommandType[],
  index: number,
  layout: Partial<Pick<Mission, "gridSize" | "start" | "startDirection" | "target" | "obstacles" | "solution" | "maxCards">> = {}
): Mission {
  const videoIndexes = [1, 4, 8];
  return {
    id,
    planetId,
    title,
    goal,
    ability: planetId === "loop" ? "loop" : planetId === "debug" ? "debug" : index === 3 || index === 4 ? "direction" : "sequence",
    introKind: videoIndexes.includes(index) ? "video" : "voice",
    gridSize: layout.gridSize ?? (index <= 3 ? 4 : index <= 8 ? 5 : 6),
    start: layout.start ?? { x: 0, y: 1 },
    startDirection: layout.startDirection ?? "east",
    target: layout.target ?? { x: index <= 3 ? 2 : index <= 8 ? 3 : 4, y: 1 },
    obstacles: layout.obstacles ?? [],
    availableCards,
    solution: layout.solution ?? forward(index <= 3 ? 2 : index <= 8 ? 3 : 4),
    maxCards: layout.maxCards ?? (index <= 3 ? 4 : 6),
    reward
  };
}

function forward(count: number): CommandStep[] {
  return Array.from({ length: count }, () => ({ type: "forward" }));
}

function steps(types: CommandType[]): CommandStep[] {
  return types.map((type) => (type === "repeat" ? { type, repeatCount: 3 } : { type }));
}

function layout(
  gridSize: number,
  start: Cell,
  startDirection: Direction,
  target: Cell,
  solution: CommandStep[],
  maxCards = solution.length,
  obstacles: Cell[] = []
) {
  return { gridSize, start, startDirection, target, solution, maxCards, obstacles };
}

export const planets: Planet[] = [
  {
    id: "direction",
    title: "方向星球",
    abilityLabel: "方向和顺序",
    story: "机器人刚刚醒来，需要你帮它找到飞船基地。",
    badge: "方向指挥官",
    missions: [
      {
        ...mission("direction-1", "direction", "机器人醒来", "让机器人走到能量站", "飞船能源灯", ["forward"], 1),
        target: { x: 3, y: 1 },
        solution: forward(3),
        maxCards: 3
      },
      mission("direction-2", "direction", "找到基地", "连续前进找到基地", "基地定位器", ["forward"], 2, layout(4, { x: 0, y: 2 }, "east", { x: 3, y: 2 }, forward(3), 3)),
      mission("direction-3", "direction", "第一次转弯", "先右转，再前进到基地", "转向芯片", directionCards, 3, layout(4, { x: 1, y: 2 }, "north", { x: 2, y: 2 }, steps(["right", "forward"]), 2)),
      mission("direction-4", "direction", "绕过小陨石", "绕开小陨石到达终点", "陨石探测器", directionCards, 4, layout(5, { x: 0, y: 1 }, "east", { x: 2, y: 0 }, steps(["left", "forward", "right", "forward", "forward"]), 5, [{ x: 1, y: 1 }])),
      mission("direction-5", "direction", "转向找能量", "先向右走，再转向上方能量", "蓝色能量块", directionCards, 5, layout(5, { x: 0, y: 2 }, "east", { x: 3, y: 1 }, steps(["forward", "forward", "left", "forward", "right", "forward"]), 6)),
      mission("direction-6", "direction", "三步到维修点", "连续前进三步到维修点", "修理扳手", directionCards, 6, layout(5, { x: 0, y: 3 }, "east", { x: 3, y: 3 }, forward(3), 4)),
      mission("direction-7", "direction", "太空小路", "规划一条完整路线", "星路线图", directionCards, 7, layout(5, { x: 1, y: 3 }, "east", { x: 4, y: 1 }, steps(["forward", "forward", "left", "forward", "forward", "right", "forward"]), 7, [{ x: 2, y: 2 }])),
      mission("direction-8", "direction", "修复信号塔", "到达信号塔完成修复", "信号天线", directionCards, 8, layout(5, { x: 0, y: 4 }, "east", { x: 3, y: 2 }, steps(["forward", "forward", "left", "forward", "forward", "right", "forward"]), 7, [{ x: 1, y: 3 }])),
      mission("direction-9", "direction", "方向星球挑战", "独立指挥机器人回到飞船", "方向指挥官徽章", directionCards, 9, layout(6, { x: 0, y: 5 }, "east", { x: 4, y: 2 }, steps(["forward", "forward", "left", "forward", "forward", "forward", "right", "forward", "forward"]), 9, [{ x: 1, y: 4 }, { x: 3, y: 3 }]))
    ]
  },
  {
    id: "loop",
    title: "循环星球",
    abilityLabel: "重复和规律",
    story: "这里有很多重复路线，机器人需要更省力的指令。",
    badge: "循环小工程师",
    missions: [
      mission("loop-1", "loop", "连续采矿", "用重复指令连续采矿", "采矿机械臂", ["forward", "repeat"], 1, layout(4, { x: 0, y: 1 }, "east", { x: 3, y: 1 }, steps(["repeat"]), 2)),
      mission("loop-2", "loop", "能量带", "重复收集 3 次能量", "黄色能量块", ["forward", "repeat"], 2, layout(4, { x: 0, y: 2 }, "east", { x: 3, y: 2 }, steps(["repeat"]), 2)),
      mission("loop-3", "loop", "跳过小坑", "用跳跃卡跨过小坑", "弹跳靴", ["forward", "jump"], 3, layout(4, { x: 0, y: 3 }, "east", { x: 3, y: 3 }, steps(["jump", "forward"]), 2, [{ x: 1, y: 3 }])),
      mission("loop-4", "loop", "转圈小路", "按前进和右转走一圈", "环形轨道", loopCards, 4, layout(5, { x: 2, y: 2 }, "east", { x: 2, y: 2 }, steps(["forward", "right", "forward", "right", "forward", "right", "forward"]), 7, [{ x: 2, y: 1 }])),
      mission("loop-5", "loop", "简化长路线", "用更少卡片完成长路线", "省力芯片", loopCards, 5, layout(5, { x: 0, y: 4 }, "east", { x: 4, y: 4 }, steps(["repeat", "forward"]), 2)),
      mission("loop-6", "loop", "重复加转弯", "把重复和转弯连起来", "方形路线徽记", loopCards, 6, layout(5, { x: 1, y: 3 }, "east", { x: 4, y: 0 }, steps(["repeat", "left", "repeat"]), 3)),
      mission("loop-7", "loop", "找规律", "找出路线里的规律", "规律扫描仪", loopCards, 7, layout(5, { x: 0, y: 0 }, "east", { x: 3, y: 3 }, steps(["repeat", "right", "repeat"]), 3, [{ x: 4, y: 1 }])),
      mission("loop-8", "loop", "节省卡片挑战", "尽量少用卡片完成任务", "精简指令牌", loopCards, 8, layout(5, { x: 1, y: 4 }, "east", { x: 4, y: 1 }, steps(["repeat", "left", "repeat"]), 3, [{ x: 2, y: 3 }])),
      mission("loop-9", "loop", "循环星球挑战", "用重复指令修好能源核心", "循环小工程师徽章", loopCards, 9, layout(6, { x: 0, y: 5 }, "east", { x: 3, y: 2 }, steps(["repeat", "left", "repeat"]), 3, [{ x: 1, y: 4 }, { x: 4, y: 3 }]))
    ]
  },
  {
    id: "debug",
    title: "调试星球",
    abilityLabel: "发现和修改问题",
    story: "飞船系统有些小问题，需要你帮机器人找出原因。",
    badge: "调试小侦探",
    missions: [
      mission("debug-1", "debug", "检查直线路线", "确认两张前进卡能到目标", "错误放大镜", directionCards, 1, layout(4, { x: 0, y: 1 }, "east", { x: 2, y: 1 }, forward(2), 3)),
      mission("debug-2", "debug", "检查转向路线", "先右转身，再沿路线到目标", "方向校准器", directionCards, 2, layout(4, { x: 0, y: 2 }, "north", { x: 2, y: 1 }, steps(["right", "forward", "forward", "left", "forward"]), 5)),
      mission("debug-3", "debug", "补完整路线", "连续前进三步到目标", "补丁卡片", directionCards, 3, layout(4, { x: 0, y: 1 }, "east", { x: 3, y: 1 }, forward(3), 4)),
      mission("debug-4", "debug", "排好路线顺序", "先前进，再左转身到目标", "排序芯片", directionCards, 4, layout(5, { x: 0, y: 2 }, "east", { x: 2, y: 1 }, steps(["forward", "forward", "left", "forward"]), 4)),
      mission("debug-5", "debug", "绕开挡路陨石", "先绕到上方，再向右到目标", "路线修复器", directionCards, 5, layout(5, { x: 0, y: 2 }, "east", { x: 3, y: 1 }, steps(["left", "forward", "right", "forward", "forward", "forward"]), 6, [{ x: 1, y: 2 }])),
      mission("debug-6", "debug", "检查重复三步", "用重复卡连续前进三格", "次数计数器", debugCards, 6, layout(5, { x: 0, y: 3 }, "east", { x: 3, y: 3 }, steps(["repeat"]), 3)),
      mission("debug-7", "debug", "重复后再转向", "先重复前进，再左转身向上走", "问题探针", debugCards, 7, layout(5, { x: 1, y: 4 }, "east", { x: 4, y: 2 }, steps(["repeat", "left", "forward", "forward"]), 4, [{ x: 3, y: 3 }])),
      mission("debug-8", "debug", "复盘长路线", "先向右走三格，再左转身向上走", "复盘记录仪", debugCards, 8, layout(5, { x: 0, y: 4 }, "east", { x: 3, y: 2 }, steps(["forward", "forward", "forward", "left", "forward", "forward"]), 6, [{ x: 1, y: 3 }])),
      mission("debug-9", "debug", "调试星球挑战", "用重复和转身修好终点路线", "调试小侦探徽章", debugCards, 9, layout(6, { x: 0, y: 5 }, "east", { x: 3, y: 2 }, steps(["repeat", "left", "repeat"]), 3, [{ x: 2, y: 4 }, { x: 4, y: 4 }]))
    ]
  }
];

export function findMission(id: string) {
  return planets.flatMap((planet) => planet.missions).find((item) => item.id === id) ?? planets[0].missions[0];
}

export function findCard(type: CommandType) {
  return commandCards.find((card) => card.type === type) ?? commandCards[0];
}

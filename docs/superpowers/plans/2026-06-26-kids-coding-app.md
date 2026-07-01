# Kids Coding App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based first prototype of the 5-7 year old family coding app where a child explores a space map, completes card-based robot missions, earns rewards, and a parent can view a simple learning report.

**Architecture:** Create a Vite + React + TypeScript app with a small local data model for planets, lessons, cards, rewards, and progress. Keep game logic in pure functions so movement, success, failure, and reports can be tested without the UI. Store child name, robot name, and progress in browser local storage.

**Tech Stack:** Vite, React, TypeScript, Vitest, React Testing Library, CSS Modules or plain CSS.

---

## File Structure

- Create `package.json`: project scripts and dependencies.
- Create `index.html`: app entry HTML.
- Create `vite.config.ts`: Vite and Vitest configuration.
- Create `tsconfig.json`: TypeScript settings.
- Create `src/main.tsx`: React entry point.
- Create `src/App.tsx`: top-level screen routing.
- Create `src/styles.css`: global visual style.
- Create `src/data/course.ts`: three planets, 27 missions, videos, rewards, and card definitions.
- Create `src/types.ts`: shared app types.
- Create `src/state/progress.ts`: local storage progress helpers.
- Create `src/logic/robotEngine.ts`: pure robot movement and mission checking.
- Create `src/logic/report.ts`: parent report calculation.
- Create `src/components/StartScreen.tsx`: child and robot name setup plus continue button.
- Create `src/components/PlanetMap.tsx`: space map with planet and mission selection.
- Create `src/components/MissionIntro.tsx`: short video or animation placeholder and mission goal.
- Create `src/components/MissionPlay.tsx`: card-based robot operation.
- Create `src/components/ResultScreen.tsx`: success, retry, and reward feedback.
- Create `src/components/RewardBay.tsx`: ship parts, robot equipment, and badges.
- Create `src/components/ParentGate.tsx`: child-safe parent entry.
- Create `src/components/ParentReport.tsx`: progress, ability, stuck point, and review suggestions.
- Create `src/__tests__/robotEngine.test.ts`: robot movement tests.
- Create `src/__tests__/report.test.ts`: parent report tests.
- Create `src/__tests__/appFlow.test.tsx`: core screen flow tests.

## Task 1: Create The App Skeleton

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`

- [ ] **Step 1: Add project metadata and scripts**

Create `package.json`:

```json
{
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@testing-library/user-event": "latest",
    "jsdom": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 2: Add app entry files**

Create `index.html`:

```html
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>太空机器人编程</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `vite.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["@testing-library/jest-dom/vitest"]
  }
});
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": []
}
```

- [ ] **Step 3: Add first render**

Create `src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Create `src/App.tsx`:

```tsx
export function App() {
  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">太空机器人编程</p>
        <h1>小小指挥官，准备修复飞船</h1>
        <p>用指令卡片让机器人前进、转弯、重复和修正路线。</p>
      </section>
    </main>
  );
}
```

Create `src/styles.css` with these concrete base rules:

```css
:root {
  color: #172033;
  background: #eef6ff;
  font-family: "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
}

body {
  margin: 0;
}

button {
  min-height: 48px;
  border: 0;
  border-radius: 8px;
  font: inherit;
  cursor: pointer;
}

.app-shell {
  min-height: 100vh;
  background: radial-gradient(circle at 20% 10%, #fff7c7 0 12%, transparent 28%), #eef6ff;
  padding: 24px;
}

.hero-panel,
.screen-panel {
  max-width: 980px;
  margin: 0 auto;
}

.eyebrow {
  color: #3166b8;
  font-weight: 700;
}
```

- [ ] **Step 4: Install and verify**

Run:

```bash
npm install
npm run build
```

Expected: build completes with no TypeScript or Vite errors.

## Task 2: Define Course Data And Types

**Files:**
- Create: `src/types.ts`
- Create: `src/data/course.ts`

- [ ] **Step 1: Define shared types**

Create `src/types.ts`:

```ts
export type Ability = "direction" | "sequence" | "loop" | "debug";

export type CommandType = "forward" | "backward" | "left" | "right" | "jump" | "repeat";

export type Cell = {
  x: number;
  y: number;
};

export type Direction = "north" | "east" | "south" | "west";

export type CommandCard = {
  type: CommandType;
  label: string;
  icon: string;
  repeatCount?: number;
};

export type Mission = {
  id: string;
  planetId: string;
  title: string;
  goal: string;
  ability: Ability;
  introKind: "video" | "voice";
  gridSize: number;
  start: Cell;
  startDirection: Direction;
  target: Cell;
  obstacles: Cell[];
  availableCards: CommandType[];
  maxCards: number;
  reward: string;
};

export type Planet = {
  id: string;
  title: string;
  abilityLabel: string;
  story: string;
  missions: Mission[];
  badge: string;
};

export type ProgressRecord = {
  childName: string;
  robotName: string;
  completedMissionIds: string[];
  attemptsByMissionId: Record<string, number>;
  unlockedRewards: string[];
  lastMissionId: string;
};
```

- [ ] **Step 2: Add three planets and 27 missions**

Create `src/data/course.ts` with:

```ts
import type { CommandCard, Planet } from "../types";

export const commandCards: CommandCard[] = [
  { type: "forward", label: "前进", icon: "ArrowUp" },
  { type: "backward", label: "后退", icon: "ArrowDown" },
  { type: "left", label: "左转", icon: "RotateCcw" },
  { type: "right", label: "右转", icon: "RotateCw" },
  { type: "jump", label: "跳跃", icon: "ChevronsUp" },
  { type: "repeat", label: "重复", icon: "Repeat2", repeatCount: 3 }
];

export const planets: Planet[] = [
  {
    id: "direction",
    title: "方向星球",
    abilityLabel: "方向和顺序",
    story: "机器人刚刚醒来，需要你帮它找到飞船基地。",
    badge: "方向指挥官",
    missions: [
      {
        id: "direction-1",
        planetId: "direction",
        title: "机器人醒来",
        goal: "让机器人走到能量站",
        ability: "sequence",
        introKind: "video",
        gridSize: 4,
        start: { x: 0, y: 2 },
        startDirection: "east",
        target: { x: 2, y: 2 },
        obstacles: [],
        availableCards: ["forward"],
        maxCards: 3,
        reward: "飞船能源灯"
      }
    ]
  }
];
```

Add the remaining missions using these exact ids, titles, and rewards:

| id | title | reward |
| --- | --- | --- |
| `direction-2` | 找到基地 | 基地定位器 |
| `direction-3` | 第一次转弯 | 转向芯片 |
| `direction-4` | 绕过小陨石 | 陨石探测器 |
| `direction-5` | 收集两块能量 | 蓝色能量块 |
| `direction-6` | 少一步会怎样 | 修理扳手 |
| `direction-7` | 太空小路 | 星路线图 |
| `direction-8` | 修复信号塔 | 信号天线 |
| `direction-9` | 星球挑战 | 方向指挥官徽章 |
| `loop-1` | 连续采矿 | 采矿机械臂 |
| `loop-2` | 能量带 | 黄色能量块 |
| `loop-3` | 跳过小坑 | 弹跳靴 |
| `loop-4` | 重复转圈 | 环形轨道 |
| `loop-5` | 简化长路线 | 省力芯片 |
| `loop-6` | 重复加转弯 | 方形路线徽记 |
| `loop-7` | 找规律 | 规律扫描仪 |
| `loop-8` | 节省卡片挑战 | 精简指令牌 |
| `loop-9` | 星球挑战 | 循环小工程师徽章 |
| `debug-1` | 机器人走错了 | 错误放大镜 |
| `debug-2` | 转错方向了 | 方向校准器 |
| `debug-3` | 少了一步 | 补丁卡片 |
| `debug-4` | 顺序乱了 | 排序芯片 |
| `debug-5` | 陨石挡路 | 路线修复器 |
| `debug-6` | 重复次数不对 | 次数计数器 |
| `debug-7` | 哪张卡有问题 | 问题探针 |
| `debug-8` | 帮机器人复盘 | 复盘记录仪 |
| `debug-9` | 星球挑战 | 调试小侦探徽章 |

For every mission, use a reachable target and only the cards listed for that learning stage. Use 4x4 grids for the first three missions of each planet, 5x5 grids for missions four to eight, and a 6x6 grid for each planet challenge.

- [ ] **Step 3: Verify data compiles**

Run:

```bash
npm run build
```

Expected: build completes with no type errors.

## Task 3: Build Robot Movement Logic

**Files:**
- Create: `src/logic/robotEngine.ts`
- Create: `src/__tests__/robotEngine.test.ts`

- [ ] **Step 1: Write movement tests**

Create `src/__tests__/robotEngine.test.ts`:

```ts
import { runMission } from "../logic/robotEngine";
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
});
```

- [ ] **Step 2: Run the tests and verify failure**

Run:

```bash
npm test -- src/__tests__/robotEngine.test.ts
```

Expected: FAIL because `src/logic/robotEngine.ts` does not exist yet.

- [ ] **Step 3: Implement movement**

Create `src/logic/robotEngine.ts`:

```ts
import type { Cell, CommandType, Direction, Mission } from "../types";

export type RuntimeCommand = {
  type: CommandType;
  repeatCount?: number;
};

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
  if (command === "backward") {
    return direction === "north"
      ? { x: position.x, y: position.y + 1 }
      : direction === "south"
        ? { x: position.x, y: position.y - 1 }
        : direction === "east"
          ? { x: position.x - 1, y: position.y }
          : { x: position.x + 1, y: position.y };
  }

  return direction === "north"
    ? { x: position.x, y: position.y - 1 }
    : direction === "south"
      ? { x: position.x, y: position.y + 1 }
      : direction === "east"
        ? { x: position.x + 1, y: position.y }
        : { x: position.x - 1, y: position.y };
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

  return {
    success: sameCell(position, mission.target),
    finalPosition: position,
    finalDirection: direction,
    visited,
    reason: sameCell(position, mission.target) ? "target" : "not-there"
  };
}
```

- [ ] **Step 4: Verify movement tests pass**

Run:

```bash
npm test -- src/__tests__/robotEngine.test.ts
```

Expected: PASS.

## Task 4: Add Progress Storage And Report Logic

**Files:**
- Create: `src/state/progress.ts`
- Create: `src/logic/report.ts`
- Create: `src/__tests__/report.test.ts`

- [ ] **Step 1: Add report tests**

Create `src/__tests__/report.test.ts`:

```ts
import { buildParentReport } from "../logic/report";
import type { ProgressRecord } from "../types";

const progress: ProgressRecord = {
  childName: "小宇",
  robotName: "豆豆",
  completedMissionIds: ["direction-1", "direction-2", "loop-1"],
  attemptsByMissionId: { "direction-1": 1, "direction-2": 3, "loop-1": 2 },
  unlockedRewards: ["飞船能源灯"],
  lastMissionId: "loop-1"
};

describe("buildParentReport", () => {
  it("summarizes progress in parent-friendly language", () => {
    const report = buildParentReport(progress);
    expect(report.completedCount).toBe(3);
    expect(report.childName).toBe("小宇");
    expect(report.stuckPoint).toContain("direction-2");
    expect(report.suggestion.length).toBeGreaterThan(4);
  });
});
```

- [ ] **Step 2: Run report test and verify failure**

Run:

```bash
npm test -- src/__tests__/report.test.ts
```

Expected: FAIL because `buildParentReport` does not exist yet.

- [ ] **Step 3: Implement storage and report helpers**

Create `src/state/progress.ts`:

```ts
import type { ProgressRecord } from "../types";

const key = "space-coding-progress";

export const defaultProgress: ProgressRecord = {
  childName: "小小指挥官",
  robotName: "豆豆",
  completedMissionIds: [],
  attemptsByMissionId: {},
  unlockedRewards: [],
  lastMissionId: "direction-1"
};

export function loadProgress(): ProgressRecord {
  const stored = window.localStorage.getItem(key);
  return stored ? { ...defaultProgress, ...JSON.parse(stored) } : defaultProgress;
}

export function saveProgress(progress: ProgressRecord) {
  window.localStorage.setItem(key, JSON.stringify(progress));
}
```

Create `src/logic/report.ts`:

```ts
import type { ProgressRecord } from "../types";

export function buildParentReport(progress: ProgressRecord) {
  const difficultMission = Object.entries(progress.attemptsByMissionId).sort((a, b) => b[1] - a[1])[0];

  return {
    childName: progress.childName,
    robotName: progress.robotName,
    completedCount: progress.completedMissionIds.length,
    rewardCount: progress.unlockedRewards.length,
    stuckPoint: difficultMission ? `${difficultMission[0]} 重试了 ${difficultMission[1]} 次` : "目前没有明显卡点",
    suggestion: difficultMission
      ? "下次可以先从相近任务复习，让孩子自己说出机器人要先做什么。"
      : "可以继续完成下一关，保持每次 8-12 分钟的轻量体验。"
  };
}
```

- [ ] **Step 4: Verify report tests pass**

Run:

```bash
npm test -- src/__tests__/report.test.ts
```

Expected: PASS.

## Task 5: Build Child Screens And Navigation

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/StartScreen.tsx`
- Create: `src/components/PlanetMap.tsx`
- Create: `src/components/MissionIntro.tsx`
- Create: `src/components/RewardBay.tsx`
- Create: `src/__tests__/appFlow.test.tsx`

- [ ] **Step 1: Write app flow test**

Create `src/__tests__/appFlow.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../App";

describe("App flow", () => {
  it("lets a child move from start screen to planet map", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "开始太空任务" }));
    expect(screen.getByText("方向星球")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run app flow test and verify failure**

Run:

```bash
npm test -- src/__tests__/appFlow.test.tsx
```

Expected: FAIL because the start and map screens do not exist yet.

- [ ] **Step 3: Implement navigation screens**

Create `StartScreen` with two optional inputs labelled `孩子名字` and `机器人名字`, one primary button `开始太空任务`, and one secondary button `家长查看`.

Create `PlanetMap` with three planet buttons labelled `方向星球`, `循环星球`, and `调试星球`. Show mission buttons using mission titles. Locked missions should be visible but disabled.

Create `MissionIntro` with the mission title, one sentence goal, a visual placeholder labelled `短动画`, and one primary button `进入任务`.

Create `RewardBay` with three sections labelled `飞船零件`, `机器人装备`, and `星球徽章`. Empty sections should show `还没有获得，完成任务后会出现在这里。`

Modify `App.tsx` to switch between `"start"`, `"map"`, `"intro"`, and `"rewards"` screens with React state.

- [ ] **Step 4: Verify flow**

Run:

```bash
npm test -- src/__tests__/appFlow.test.tsx
npm run build
```

Expected: tests and build pass.

## Task 6: Build Mission Play And Result Feedback

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/MissionPlay.tsx`
- Create: `src/components/ResultScreen.tsx`
- Modify: `src/state/progress.ts`

- [ ] **Step 1: Add play flow test**

Extend `src/__tests__/appFlow.test.tsx` with:

```tsx
it("lets a child run a simple mission and see a reward", async () => {
  render(<App />);
  await userEvent.click(screen.getByRole("button", { name: "开始太空任务" }));
  await userEvent.click(screen.getByRole("button", { name: /机器人醒来/ }));
  await userEvent.click(screen.getByRole("button", { name: /进入任务/ }));
  await userEvent.click(screen.getByRole("button", { name: "前进" }));
  await userEvent.click(screen.getByRole("button", { name: "前进" }));
  await userEvent.click(screen.getByRole("button", { name: "开始执行" }));
  expect(screen.getByText(/完成任务/)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run play flow test and verify failure**

Run:

```bash
npm test -- src/__tests__/appFlow.test.tsx
```

Expected: FAIL because mission play is not implemented.

- [ ] **Step 3: Implement card selection and robot execution**

Create `MissionPlay.tsx` with the mission goal at the top, a square grid showing robot, target, and obstacles, a selected command row labelled `我的指令`, available card buttons using Chinese labels from `commandCards`, a `清空` button, and a `开始执行` button.

Use `runMission` to determine success. Create `ResultScreen.tsx` with success title `完成任务`, retry title `机器人还没找到路，我们换一步试试。`, and reward display text `获得奖励`.

- [ ] **Step 4: Save progress on success**

When a mission succeeds, update `completedMissionIds`, `attemptsByMissionId`, `unlockedRewards`, and `lastMissionId` through `saveProgress`.

- [ ] **Step 5: Verify play flow**

Run:

```bash
npm test -- src/__tests__/appFlow.test.tsx
npm run build
```

Expected: tests and build pass.

## Task 7: Build Parent Gate And Report

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/ParentGate.tsx`
- Create: `src/components/ParentReport.tsx`
- Modify: `src/__tests__/appFlow.test.tsx`

- [ ] **Step 1: Add parent flow test**

Extend `src/__tests__/appFlow.test.tsx` with:

```tsx
it("protects parent report behind a simple gate", async () => {
  render(<App />);
  await userEvent.click(screen.getByRole("button", { name: "家长查看" }));
  expect(screen.getByText("请输入 3 + 2 的答案")).toBeInTheDocument();
  await userEvent.type(screen.getByLabelText("答案"), "5");
  await userEvent.click(screen.getByRole("button", { name: "查看报告" }));
  expect(screen.getByText(/学习报告/)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run parent flow test and verify failure**

Run:

```bash
npm test -- src/__tests__/appFlow.test.tsx
```

Expected: FAIL because parent gate is not implemented.

- [ ] **Step 3: Implement parent gate and report**

Create a simple gate using `3 + 2`. The label must be `请输入 3 + 2 的答案`, the input accessible name must be `答案`, and the submit button must be `查看报告`. After correct input, render a report from `buildParentReport(loadProgress())` with these labels: `学习报告`, `完成关卡`, `获得奖励`, `最近卡点`, and `下次建议`.

- [ ] **Step 4: Verify parent flow**

Run:

```bash
npm test -- src/__tests__/appFlow.test.tsx
npm run build
```

Expected: tests and build pass.

## Task 8: Polish For A 5-7 Year Old Child

**Files:**
- Modify: `src/styles.css`
- Modify: relevant files under `src/components/`

- [ ] **Step 1: Improve visual clarity**

Make all primary buttons at least 48px tall. Use large labels, clear icon spacing, high contrast, and no dense paragraphs in child-facing screens.

- [ ] **Step 2: Add friendly failure copy**

Use copy like:

```txt
机器人还没找到路，我们换一步试试。
```

Do not use copy like:

```txt
答错了。
```

- [ ] **Step 3: Verify on desktop and mobile**

Run:

```bash
npm run dev
```

Open the local URL and check:

- Start screen fits without scrolling on desktop.
- Mission play screen keeps map, selected cards, and available cards visible.
- Buttons are easy to tap on a narrow mobile viewport.
- No text overlaps or spills out of buttons.

## Task 9: Final Verification

**Files:**
- All created files.

- [ ] **Step 1: Run automated checks**

Run:

```bash
npm test
npm run build
```

Expected: all tests pass and production build succeeds.

- [ ] **Step 2: Run manual child flow**

Run:

```bash
npm run dev
```

Manually verify:

- Start screen opens.
- Child can enter the map.
- Direction star mission can be opened.
- Child can add cards and run the robot.
- Success shows a reward.
- Retry path uses friendly language.
- Parent gate opens report only after the correct answer.

- [ ] **Step 3: Record what was verified**

Add a short `docs/verification.md` containing:

```md
# Verification

- `npm test`: passed
- `npm run build`: passed
- Manual child flow: passed
- Manual parent report flow: passed
```

If any check fails, fix the issue before marking the task complete.
